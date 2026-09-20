import { calculateSaju, elementCounts, pillarsOf, tenGodOf, WuXing } from '../lib/saju';
import { ILGAN } from '../lib/content/ilgan';
import { ILJU } from '../lib/content/ilju';
import { TEN_GODS } from '../lib/content/tenGods';
import { ELEMENT_BALANCED, ELEMENT_LACKING, ELEMENT_STRONG } from '../lib/content/elements';
import { elementInsights, interpretPillar } from '../lib/interpret';

let pass = 0, fail = 0;
const ok = (label: string, cond: boolean, extra?: unknown) => (cond ? pass++ : (fail++, console.log('FAIL', label, extra ?? '')));

const GAN = '甲乙丙丁戊己庚辛壬癸'.split('');
const ZHI = '子丑寅卯辰巳午未申酉戌亥'.split('');
const BANNED = ['죽', '사망', '이혼', '재앙', '불행', '질병', '파산', '망한', '저주', '큰일', '반드시', '절대'];
const clean = (s: string) => !/undefined|NaN|null|\[object/.test(s) && !BANNED.some((w) => s.includes(w));

// 60갑자 completeness
const cycle = Array.from({ length: 60 }, (_, i) => GAN[i % 10] + ZHI[i % 12]);
ok('ILJU has exactly the 60 cycle keys', JSON.stringify(Object.keys(ILJU).sort()) === JSON.stringify([...cycle].sort()), Object.keys(ILJU).length);
for (const k of cycle) ok(`ILJU ${k}`, ILJU[k]?.includes(' — ') && ILJU[k].length >= 15 && ILJU[k].length <= 60 && clean(ILJU[k]), ILJU[k]);
ok('ILJU lines are unique', new Set(Object.values(ILJU)).size === 60);

// 일간
ok('ILGAN has 10 stems', JSON.stringify(Object.keys(ILGAN).sort()) === JSON.stringify([...GAN].sort()));
for (const g of GAN) for (const f of ['summary', 'personality', 'wealth', 'love'] as const) {
  const t = ILGAN[g][f];
  ok(`ILGAN ${g}.${f}`, t.length >= 15 && clean(t), t);
}
for (const f of ['personality', 'wealth', 'love'] as const) ok(`ILGAN ${f} unique`, new Set(GAN.map((g) => ILGAN[g][f])).size === 10);

// 십신 + 오행 text
ok('TEN_GODS has 10', Object.keys(TEN_GODS).length === 10);
for (const [name, g] of Object.entries(TEN_GODS)) ok(`TEN_GODS ${name}`, g.meaning.length > 5 && g.today.length > 15 && clean(g.today + g.meaning));
for (const el of ['wood', 'fire', 'earth', 'metal', 'water'] as WuXing[]) ok(`element text ${el}`, clean(ELEMENT_LACKING[el] + ELEMENT_STRONG[el]));

// Random charts: every pillar interpretation is well-formed and consistent with the chart
let seed = 7; const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
let bad = 0;
for (let i = 0; i < 2000; i++) {
  const withHour = rnd() > 0.2;
  const saju = calculateSaju({
    gender: rnd() > 0.5 ? 'male' : 'female', year: 1930 + Math.floor(rnd() * 90), month: 1 + Math.floor(rnd() * 12), day: 1 + Math.floor(rnd() * 28),
    hour: withHour ? Math.floor(rnd() * 24) : null, minute: withHour ? Math.floor(rnd() * 60) : null, calendarType: 'solar',
  });
  for (const { key, pillar } of pillarsOf(saju)) {
    const text = interpretPillar(saju, key);
    const lines = text.split('\n');
    const good = clean(text) && lines.length === 3 && (key === 'day' ? text.startsWith(ILJU[pillar.ganZhi]) : text.includes(tenGodOf(saju.day.gan, pillar.gan)) && text.includes(pillar.gan) && text.includes(pillar.zhi));
    if (!good) { bad++; if (bad < 4) console.log('BAD', key, text); }
  }
  ok('no hour pillar text when hour unknown', withHour || interpretPillar(saju, 'hour') === '');
  const counts = elementCounts(saju);
  const ins = elementInsights(saju);
  ok('insights non-empty & clean', ins.length > 0 && ins.every(clean));
  for (const el of ['wood', 'fire', 'earth', 'metal', 'water'] as WuXing[]) {
    if (counts[el] === 0) ok('lacking comment present', ins.includes(ELEMENT_LACKING[el]));
    if (counts[el] >= 3) ok('strong comment present', ins.includes(ELEMENT_STRONG[el]));
  }
  const anyFlag = (Object.values(counts) as number[]).some((c) => c === 0 || c >= 3);
  ok('balanced only when nothing flagged', anyFlag === !ins.includes(ELEMENT_BALANCED));
}
ok('pillar interpretation well-formed (2000 charts)', bad === 0, bad);

// sample output for eyeballing
const sample = calculateSaju({ gender: 'female', year: 1996, month: 3, day: 14, hour: 15, minute: 30, calendarType: 'solar' });
for (const { key } of pillarsOf(sample)) console.log(`\n[${key}]\n${interpretPillar(sample, key)}`);
console.log('\n[오행]', elementInsights(sample).join(' / '));
console.log(`\n${pass} passed, ${fail} failed`);
