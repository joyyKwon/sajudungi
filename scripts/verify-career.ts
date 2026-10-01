// 직업·적성: content shape, the A·B·C samples, and invariants over random charts.
import { calculateSaju, tenGodOf, ZHI_MAIN_GAN } from '../lib/saju';
import { TEN_GODS } from '../lib/content/tenGods';
import { GROUP_ORDER } from '../lib/content/tenGodGroups';
import { CAREER_BALANCED, CAREER_BY_GROUP, CAREER_STYLE_BY_MONTH_GOD, CAREER_TIP_BY_LACKING } from '../lib/content/career';
import { careerOf } from '../lib/career';
import { analyzeGroups, tenGodGroupCounts } from '../lib/tenGodGroups';

let pass = 0, fail = 0;
const ok = (label: string, cond: boolean, extra?: unknown) => (cond ? pass++ : (fail++, console.log('FAIL', label, extra ?? '')));

const BANNED = ['죽', '사망', '이혼', '재앙', '불행', '질병', '파산', '망한', '저주', '큰일', '반드시', '절대'];
const clean = (s: string) => !/undefined|NaN|null|\[object/.test(s) && !BANNED.some((w) => s.includes(w));
const items = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);
const sentences = (s: string) => s.split(/(?<=[.요])\s+/).filter(Boolean).length;

// Content
for (const [name, f] of [...Object.entries(CAREER_BY_GROUP), ['balanced', CAREER_BALANCED] as const]) {
  ok(`${name}: 3 keywords`, items(f.keywords).length === 3 && clean(f.keywords), f.keywords);
  ok(`${name}: 6 jobs`, items(f.jobs).length === 6 && clean(f.jobs), f.jobs);
  ok(`${name}: 4+ sentences`, sentences(f.body) >= 4 && f.body.length >= 180 && clean(f.body), f.body.length);
}
ok('5 groups', GROUP_ORDER.every((g) => !!CAREER_BY_GROUP[g]));
for (const g of Object.keys(TEN_GODS)) {
  const t = (CAREER_STYLE_BY_MONTH_GOD as Record<string, string>)[g];
  ok(`style ${g}`, !!t && sentences(t) >= 4 && t.length >= 150 && clean(t), t?.length);
}
ok('styles unique', new Set(Object.values(CAREER_STYLE_BY_MONTH_GOD)).size === 10);
for (const g of GROUP_ORDER) ok(`tip ${g}`, CAREER_TIP_BY_LACKING[g].length >= 80 && clean(CAREER_TIP_BY_LACKING[g]));

// Samples shown to the user
const chart = (gender: 'male' | 'female', y: number, m: number, d: number, h: number) =>
  calculateSaju({ gender, year: y, month: m, day: d, hour: h, minute: 0, calendarType: 'solar' });
const A = careerOf(chart('female', 1995, 6, 15, 12));
ok('A field 비겁', A.fields.map((f) => f.group).join() === '비겁' && A.fieldsBasis === '비겁(자립과 경쟁의 기운) 3개로 가장 많아요', A.fieldsBasis);
ok('A keywords', A.keywords.join() === '자립심,실행력,책임감', A.keywords);
ok('A style 비견', A.style.text === CAREER_STYLE_BY_MONTH_GOD.비견 && A.style.basis === '사회생활 자리(월지) 午(오) · 비견');
ok('A tip 재성', A.tips.map((t) => t.group).join() === '재성' && A.tipsBasis === '재성(현실과 결과의 기운)이 사주에 드러나 있지 않아요', A.tipsBasis);
const B = careerOf(chart('female', 1992, 11, 17, 9));
ok('B field 재성 / style 정관 / tip 비겁', B.fields[0].group === '재성' && B.style.text === CAREER_STYLE_BY_MONTH_GOD.정관 && B.tips.map((t) => t.group).join() === '비겁');
const C = careerOf(chart('male', 1988, 3, 10, 15));
ok('C field 재성 / style 겁재 / tip 식상', C.fields[0].group === '재성' && C.style.text === CAREER_STYLE_BY_MONTH_GOD.겁재 && C.tips.map((t) => t.group).join() === '식상');

// Random charts
let seed = 41; const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
let balancedSeen = 0, twoFieldsSeen = 0;
for (let i = 0; i < 3000; i++) {
  const withHour = rnd() > 0.25;
  const s = calculateSaju({
    gender: rnd() > 0.5 ? 'male' : 'female', year: 1930 + Math.floor(rnd() * 90), month: 1 + Math.floor(rnd() * 12), day: 1 + Math.floor(rnd() * 28),
    hour: withHour ? Math.floor(rnd() * 24) : null, minute: withHour ? 0 : null, calendarType: 'solar',
  });
  const r = careerOf(s);
  const counts = tenGodGroupCounts(s);
  const dominant = analyzeGroups(counts).dominant;
  ok('fields follow dominant groups', r.fields.map((f) => f.group).join() === (dominant.length ? dominant.slice(0, 2).join() : ''), [r.fields.map((f) => f.group), dominant]);
  ok('1–2 fields', r.fields.length >= 1 && r.fields.length <= 2);
  ok('3 unique keywords', r.keywords.length === 3 && new Set(r.keywords).size === 3, r.keywords);
  ok('style follows 월지', r.style.text === (CAREER_STYLE_BY_MONTH_GOD as Record<string, string>)[tenGodOf(s.dayGan, ZHI_MAIN_GAN[s.month.zhi])]);
  ok('tips are absent groups', r.tips.length <= 2 && r.tips.every((t) => counts[t.group] === 0));
  ok('text clean', clean(r.fieldsBasis + r.style.basis + r.fields.map((f) => f.body + f.jobs.join()).join('')));
  if (r.fields[0].group === null) balancedSeen++;
  if (r.fields.length === 2) twoFieldsSeen++;
}
ok('balanced and two-field cases both occur', balancedSeen > 0 && twoFieldsSeen > 0, [balancedSeen, twoFieldsSeen]);

console.log(`verify-career: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
