import { BUNDLED_CONTENT, CONTENT_KEYS } from '../lib/content/bundled';
import { mergeRemoteContent } from '../lib/contentMerge';
import { getContent, setContent } from '../lib/contentStore';
import { interpretPillar } from '../lib/interpret';
import { calculateSaju } from '../lib/saju';

let pass = 0, fail = 0;
const ok = (label: string, cond: boolean, extra?: unknown) => (cond ? pass++ : (fail++, console.log('FAIL', label, extra ?? '')));
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

// The seed rows are exactly the bundled text → merging them changes nothing.
const seedRows = CONTENT_KEYS.map((key) => ({ key, value: clone(BUNDLED_CONTENT[key]) }));
let { bundle, report } = mergeRemoteContent(seedRows);
ok('seed round-trips', JSON.stringify(bundle) === JSON.stringify(BUNDLED_CONTENT) && report.applied === 0 && report.rejected.length === 0);
ok('no rows → bundled', JSON.stringify(mergeRemoteContent([]).bundle) === JSON.stringify(BUNDLED_CONTENT));

// A valid edit is applied; the rest stays.
({ bundle, report } = mergeRemoteContent([{ key: 'ILGAN', value: { 甲: { summary: '새 문구' } } }]));
ok('partial edit applied', bundle.ILGAN['甲'].summary === '새 문구' && report.applied === 1);
ok('partial edit keeps other fields', bundle.ILGAN['甲'].personality === BUNDLED_CONTENT.ILGAN['甲'].personality && bundle.ILGAN['乙'].summary === BUNDLED_CONTENT.ILGAN['乙'].summary);

// Bad values are rejected per-field and fall back.
const bad = [
  ['empty string', ''], ['blank', '   '], ['number', 7], ['null', null], ['object', {}],
  ['contains undefined', 'x undefined y'], ['too long', 'a'.repeat(2001)],
] as const;
for (const [name, value] of bad) {
  ({ bundle, report } = mergeRemoteContent([{ key: 'ILGAN', value: { 甲: { summary: value } } }]));
  ok(`reject ${name}`, bundle.ILGAN['甲'].summary === BUNDLED_CONTENT.ILGAN['甲'].summary && report.rejected.length === 1 && report.applied === 0, report);
}
for (const value of [null, 'text', 5, [1, 2]]) {
  ({ bundle, report } = mergeRemoteContent([{ key: 'ILGAN', value }]));
  ok(`reject non-object block ${JSON.stringify(value)}`, JSON.stringify(bundle.ILGAN) === JSON.stringify(BUNDLED_CONTENT.ILGAN) && report.rejected.length === 1, report);
}
({ bundle, report } = mergeRemoteContent([{ key: 'ELEMENT_BALANCED', value: { a: 1 } }]));
ok('reject wrong type for string block', bundle.ELEMENT_BALANCED === BUNDLED_CONTENT.ELEMENT_BALANCED && report.rejected.length === 1);

// Logic fields can't be changed from the server; extra keys are ignored.
({ bundle, report } = mergeRemoteContent([{ key: 'TEN_GODS', value: { 비견: { group: '재성', hanja: 'X', meaning: '바뀐 뜻', extra: 'y' } } }]));
ok('locked fields unchanged', bundle.TEN_GODS['비견'].group === '비겁' && bundle.TEN_GODS['비견'].hanja === '比肩');
ok('meaning still editable', bundle.TEN_GODS['비견'].meaning === '바뀐 뜻');
ok('extra keys dropped', !('extra' in bundle.TEN_GODS['비견']));

// Unknown keys and junk rows are reported / ignored.
({ bundle, report } = mergeRemoteContent([{ key: 'NOPE', value: 1 }, null as any, { key: 5 as any, value: 1 }]));
ok('unknown key reported', report.unknownKeys.includes('NOPE') && JSON.stringify(bundle) === JSON.stringify(BUNDLED_CONTENT));

// The bundled object is never mutated.
const before = JSON.stringify(BUNDLED_CONTENT);
mergeRemoteContent([{ key: 'ILJU', value: { 甲子: '변경' } }]);
ok('bundled not mutated', JSON.stringify(BUNDLED_CONTENT) === before);

// End to end: an edited row shows up in a real interpretation, and resets cleanly.
const saju = calculateSaju({ gender: 'female', year: 1995, month: 6, day: 15, hour: 12, minute: 0, calendarType: 'solar' });
const dayKey = saju.day.ganZhi;
const original = interpretPillar(saju, 'day');
setContent(mergeRemoteContent([{ key: 'ILJU', value: { [dayKey]: '서버에서 바꾼 일주 문구' } }]).bundle);
ok('edited text reaches interpretPillar', interpretPillar(saju, 'day').startsWith('서버에서 바꾼 일주 문구'));
setContent(BUNDLED_CONTENT);
ok('reset restores original', interpretPillar(saju, 'day') === original && getContent() === BUNDLED_CONTENT);

console.log(`verify-content-merge: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
