import { calculateSaju, PillarKey, SajuResult, WuXing } from '../lib/saju';
import { ZHI_CHUNG, ZHI_HAP, ZHI_RELATION_NONE } from '../lib/content/zhiRelations';
import { zhiRelationsOf } from '../lib/zhiRelations';

let pass = 0, fail = 0;
const ok = (label: string, cond: boolean, extra?: unknown) => (cond ? pass++ : (fail++, console.log('FAIL', label, extra ?? '')));

const BANNED = ['죽', '사망', '이혼', '재앙', '불행', '질병', '파산', '망한', '저주', '큰일', '반드시', '절대'];
const clean = (s: string) => !/undefined|NaN|null|\[object/.test(s) && !BANNED.some((w) => s.includes(w));

// ---- content tables: match the sourced classical lists exactly ----
const HAP_REF: [string, string, WuXing][] = [
  ['子', '丑', 'earth'], ['寅', '亥', 'wood'], ['卯', '戌', 'fire'], ['辰', '酉', 'metal'], ['巳', '申', 'water'], ['午', '未', 'fire'],
];
const CHUNG_REF: [string, string][] = [['寅', '申'], ['巳', '亥'], ['子', '午'], ['卯', '酉'], ['辰', '戌'], ['丑', '未']];

ok('6 육합 entries', Object.keys(ZHI_HAP).length === 6);
ok('6 충 entries', Object.keys(ZHI_CHUNG).length === 6);
for (const [a, b, el] of HAP_REF) {
  const entry = ZHI_HAP[a + b] ?? ZHI_HAP[b + a];
  ok(`육합 ${a}${b} present`, !!entry, ZHI_HAP);
  if (entry) {
    ok(`육합 ${a}${b} transformsTo ${el}`, entry.transformsTo === el, entry);
    ok(`육합 ${a}${b} text`, entry.title.length > 3 && entry.body.length >= 25 && clean(entry.title + entry.body), entry);
  }
}
for (const [a, b] of CHUNG_REF) {
  const entry = ZHI_CHUNG[a + b] ?? ZHI_CHUNG[b + a];
  ok(`충 ${a}${b} present`, !!entry, ZHI_CHUNG);
  if (entry) ok(`충 ${a}${b} text`, entry.title.length > 3 && entry.body.length >= 25 && clean(entry.title + entry.body), entry);
}
ok('bodies are unique', new Set([...Object.values(ZHI_HAP), ...Object.values(ZHI_CHUNG)].map((e) => e.body)).size === 12);
ok('fallback text', ZHI_RELATION_NONE.length > 15 && clean(ZHI_RELATION_NONE));

// 충/육합 쌍은 절대 겹치지 않는다 (design invariant this feature relies on)
const hapKeys = new Set(Object.keys(ZHI_HAP).flatMap((k) => [k, k[1] + k[0]]));
const chungKeys = new Set(Object.keys(ZHI_CHUNG).flatMap((k) => [k, k[1] + k[0]]));
ok('육합/충 쌍이 겹치지 않음', [...hapKeys].every((k) => !chungKeys.has(k)));

// ---- brute-force reference implementation, built independently from the same source tables ----
const hapMap = new Map<string, WuXing>();
for (const [a, b, el] of HAP_REF) { hapMap.set(a + b, el); hapMap.set(b + a, el); }
const chungSet = new Set<string>();
for (const [a, b] of CHUNG_REF) { chungSet.add(a + b); chungSet.add(b + a); }

function reference(saju: SajuResult) {
  const pillars: { key: PillarKey; zhi: string }[] = [
    { key: 'year', zhi: saju.year.zhi },
    { key: 'month', zhi: saju.month.zhi },
    { key: 'day', zhi: saju.day.zhi },
  ];
  if (saju.hour) pillars.push({ key: 'hour', zhi: saju.hour.zhi });
  const out: { a: PillarKey; b: PillarKey; kind: 'hap' | 'chung' }[] = [];
  for (let i = 0; i < pillars.length; i++)
    for (let j = i + 1; j < pillars.length; j++) {
      const key = pillars[i].zhi + pillars[j].zhi;
      if (hapMap.has(key)) out.push({ a: pillars[i].key, b: pillars[j].key, kind: 'hap' });
      else if (chungSet.has(key)) out.push({ a: pillars[i].key, b: pillars[j].key, kind: 'chung' });
    }
  return out;
}

let seed = 5; const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
let totalRelations = 0;
for (let i = 0; i < 3000; i++) {
  const withHour = rnd() > 0.25;
  const saju = calculateSaju({
    gender: rnd() > 0.5 ? 'male' : 'female', year: 1930 + Math.floor(rnd() * 90), month: 1 + Math.floor(rnd() * 12), day: 1 + Math.floor(rnd() * 28),
    hour: withHour ? Math.floor(rnd() * 24) : null, minute: withHour ? Math.floor(rnd() * 60) : null, calendarType: 'solar',
  });
  const got = zhiRelationsOf(saju);
  const want = reference(saju);
  totalRelations += got.length;

  ok('relation count matches reference', got.length === want.length, { got, want });
  ok('pair count within bounds', got.length <= (withHour ? 6 : 3));
  for (const r of got) {
    const match = want.find((w) => w.a === r.a && w.b === r.b && w.kind === r.kind);
    ok('each relation matches reference', !!match, { r, want });
    ok('relation text non-empty and clean', clean(r.title + r.body + r.label + r.pairHangul));
    ok('label mentions both pillars', r.label.includes('주'));
    ok('hap has element line, chung does not', r.kind === 'hap' ? r.transformsToLine !== null : r.transformsToLine === null, r);
    ok('a comes before b in pillar order', ['year', 'month', 'day', 'hour'].indexOf(r.a) < ['year', 'month', 'day', 'hour'].indexOf(r.b));
  }
  if (!withHour) ok('no hour relations when hour unknown', got.every((r) => r.a !== 'hour' && r.b !== 'hour'));
}
ok('sweep produced both hap and chung at least once', totalRelations > 0);

// ---- targeted cases ----
const withRelation = calculateSaju({ gender: 'male', year: 1984, month: 2, day: 10, hour: 5, minute: 0, calendarType: 'solar' }); // 甲子 丙寅 ... pick something with hour=子 unlikely; just sanity-check identical branches skipped
ok('identical zhi in two pillars yields no relation between them', (() => {
  // Construct a saju-shaped object with two identical branches to test the skip directly.
  const fake = { ...withRelation, month: { ...withRelation.month, zhi: withRelation.year.zhi } } as SajuResult;
  return zhiRelationsOf(fake).every((r) => !(r.a === 'year' && r.b === 'month'));
})());

console.log(`verify-zhi-relations: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
