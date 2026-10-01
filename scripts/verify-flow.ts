import { calculateSaju, sajuYearOf, tenGodOf, wolunOfYear, yearGanZhi, SajuResult } from '../lib/saju';
import { TEN_GODS } from '../lib/content/tenGods';
import { DAEUN_THEME, FLOW_UNDERTONE, MONTH_THEME, YEAR_THEME } from '../lib/content/flow';
import { GROUP_BALANCED, GROUP_INFO, GROUP_ORDER } from '../lib/content/tenGodGroups';
import { analyzeGroups, tenGodGroupCounts, GroupCounts } from '../lib/tenGodGroups';
import { daeunFlow, daeunState, monthFlow, yearFlow } from '../lib/flow';

let pass = 0, fail = 0;
const ok = (label: string, cond: boolean, extra?: unknown) => (cond ? pass++ : (fail++, console.log('FAIL', label, extra ?? '')));

const BANNED = ['죽', '사망', '이혼', '재앙', '불행', '질병', '파산', '망한', '저주', '큰일', '반드시', '절대'];
const clean = (s: string) => !/undefined|NaN|null|\[object/.test(s) && !BANNED.some((w) => s.includes(w));

// Content completeness
const GODS = Object.keys(TEN_GODS);
ok('10 gods', GODS.length === 10);
for (const g of GODS) {
  for (const [name, theme] of [['YEAR', YEAR_THEME], ['MONTH', MONTH_THEME], ['DAEUN', DAEUN_THEME]] as const) {
    const t = (theme as Record<string, { title: string; body: string }>)[g];
    ok(`${name}_THEME ${g}`, !!t && t.title.length >= 4 && t.body.length >= 30 && clean(t.title + t.body), t);
  }
}
ok('YEAR bodies unique', new Set(GODS.map((g) => (YEAR_THEME as any)[g].body)).size === 10);
ok('DAEUN bodies unique', new Set(GODS.map((g) => (DAEUN_THEME as any)[g].body)).size === 10);
ok('10 undertones, each a full sentence', GODS.every((g) => /요\.$/.test((FLOW_UNDERTONE as any)[g]) && clean((FLOW_UNDERTONE as any)[g])) && new Set(Object.values(FLOW_UNDERTONE)).size === 10);
ok('MONTH bodies unique', new Set(GODS.map((g) => (MONTH_THEME as any)[g].body)).size === 10);

// 월운: 12 contiguous months per 사주 year, following the 월건 rule (年干 → 寅月 stem)
const GANS = '甲乙丙丁戊己庚辛壬癸';
const MONTH_ZHI = '寅卯辰巳午未申酉戌亥子丑';
const YIN_STEM: Record<string, string> = { 甲: '丙', 己: '丙', 乙: '戊', 庚: '戊', 丙: '庚', 辛: '庚', 丁: '壬', 壬: '壬', 戊: '甲', 癸: '甲' };
const H = 3_600_000;
for (let y = 1950; y <= 2080; y++) {
  const w = wolunOfYear(y);
  ok(`wolun ${y}: 12 months`, w.length === 12);
  ok(`wolun ${y}: continues into next year`, w[11].endMs === wolunOfYear(y + 1)[0].startMs);
  const firstStem = GANS.indexOf(YIN_STEM[yearGanZhi(y)[0]]);
  w.forEach((m, i) => {
    ok(`wolun ${y}/${i}: branch`, m.ganZhi[1] === MONTH_ZHI[i], m);
    ok(`wolun ${y}/${i}: stem`, m.ganZhi[0] === GANS[(firstStem + i) % 10], m);
    ok(`wolun ${y}/${i}: contiguous`, m.startMs < m.endMs && (i === 11 || m.endMs === w[i + 1].startMs));
    ok(`wolun ${y}/${i}: calendar month`, m.month === (i === 11 ? 1 : i + 2) && m.calendarYear === (i === 11 ? y + 1 : y), m);
  });
}

// The month pillar of a birth inside / just after / just before each 절입 matches 월운 (2000–2040: no Korean DST).
const kstWall = (ms: number) => {
  const d = new Date(ms + 9 * H);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate(), hour: d.getUTCHours(), minute: d.getUTCMinutes() };
};
const monthPillarAt = (ms: number) =>
  calculateSaju({ gender: 'female', calendarType: 'solar', ...kstWall(ms) }).month.ganZhi;
for (const y of [2000, 2013, 2026, 2040]) {
  const w = wolunOfYear(y);
  w.forEach((m, i) => {
    ok(`wolun ${y}/${i} = 월주 mid-month`, monthPillarAt((m.startMs + m.endMs) / 2) === m.ganZhi);
    ok(`wolun ${y}/${i} = 월주 2 min after 절입`, monthPillarAt(m.startMs + 2 * 60_000) === m.ganZhi);
    if (i > 0) ok(`wolun ${y}/${i}: 2 min before 절입 is the previous month`, monthPillarAt(m.startMs - 2 * 60_000) === w[i - 1].ganZhi);
  });
}

// 입춘 2026 is 2026-02-04 05:02 KST.
ok('sajuYearOf before 입춘', sajuYearOf(new Date('2026-02-04T05:00:00+09:00')) === 2025);
ok('sajuYearOf after 입춘', sajuYearOf(new Date('2026-02-04T05:04:00+09:00')) === 2026);
ok('sajuYearOf in January', sajuYearOf(new Date('2027-01-15T12:00:00+09:00')) === 2026);
ok('sajuYearOf on New Year’s Eve', sajuYearOf(new Date('2026-12-31T23:59:00+09:00')) === 2026);
ok('5 groups', GROUP_ORDER.length === 5);
for (const g of GROUP_ORDER) {
  const i = GROUP_INFO[g];
  ok(`group ${g}`, i.meaning.length > 5 && i.headline.length > 5 && i.strong.length > 20 && i.lacking.length > 20 && clean(Object.values(i).join(' ')));
}
ok('balanced text', GROUP_BALANCED.length > 15 && clean(GROUP_BALANCED));
ok('every 십신 belongs to a known group', GODS.every((g) => GROUP_ORDER.includes((TEN_GODS as any)[g].group)));

// Group analysis on synthetic counts
const C = (a: number, b: number, c: number, d: number, e: number): GroupCounts => ({ 비겁: a, 식상: b, 재성: c, 관성: d, 인성: e });
let a = analyzeGroups(C(3, 1, 1, 1, 1));
ok('single dominant', a.dominant.join() === '비겁' && a.headline.includes('비겁') && a.insights.includes(GROUP_INFO.비겁.strong) && a.insights.length === 1, a);
a = analyzeGroups(C(2, 2, 1, 1, 1));
ok('tie shows both', a.dominant.join() === '비겁,식상' && a.headline.includes('비겁') && a.headline.includes('식상'), a);
a = analyzeGroups(C(1, 1, 1, 1, 1));
ok('all ones → balanced', a.dominant.length === 0 && a.headline === GROUP_BALANCED, a);
a = analyzeGroups(C(2, 2, 2, 2, 2));
ok('all equal → balanced', a.dominant.length === 0 && a.headline === GROUP_BALANCED, a);
a = analyzeGroups(C(0, 3, 2, 2, 0));
ok('lacking and strong reported', a.insights.includes(GROUP_INFO.비겁.lacking) && a.insights.includes(GROUP_INFO.인성.lacking) && a.insights.includes(GROUP_INFO.식상.strong), a);

// Random charts
let seed = 11; const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
for (let i = 0; i < 1500; i++) {
  const withHour = rnd() > 0.25;
  const saju: SajuResult = calculateSaju({
    gender: rnd() > 0.5 ? 'male' : 'female', year: 1930 + Math.floor(rnd() * 90), month: 1 + Math.floor(rnd() * 12), day: 1 + Math.floor(rnd() * 28),
    hour: withHour ? Math.floor(rnd() * 24) : null, minute: withHour ? Math.floor(rnd() * 60) : null, calendarType: 'solar',
  });
  const counts = tenGodGroupCounts(saju);
  const total = GROUP_ORDER.reduce((s, g) => s + counts[g], 0);
  ok('group total = 7 (with hour) / 5', total === (withHour ? 7 : 5), total);
  const an = analyzeGroups(counts);
  ok('analysis clean', clean(an.headline + an.insights.join(' ')));

  // Flow for a spread of years
  for (const y of [1990, 2024, 2026, 2031]) {
    const f = yearFlow(saju, y);
    ok('year flow ganZhi matches yearGanZhi', f.ganZhi === yearGanZhi(y) && f.label === `${y}년 세운`);
    ok('year flow god = tenGodOf', f.ganGod === tenGodOf(saju.dayGan, f.ganZhi[0]));
    ok('year flow text', clean(f.title + f.body + f.note + f.basis) && f.godLabel.includes(f.ganGod) && f.godLabel.endsWith('의 해') && f.basis.includes(f.ganGod) && f.basis.includes(f.zhiGod));
  }
  for (const m of wolunOfYear(2026)) {
    const f = monthFlow(saju, m);
    ok('month flow', clean(f.title + f.body + f.note + f.basis) && f.label === `${m.calendarYear}년 ${m.month}월 월운` && f.ganZhi === m.ganZhi && f.godLabel.endsWith('의 달'));
    ok('month flow god = tenGodOf', f.ganGod === tenGodOf(saju.dayGan, m.ganZhi[0]));
  }
  for (const d of saju.daeun) {
    const f = daeunFlow(saju, d);
    ok('daeun flow', clean(f.title + f.body + f.note + f.basis) && f.label === `${d.startAge}~${d.endAge}세 대운` && f.ganZhi === d.ganZhi);
  }

  // Current 대운 selection
  for (const now of [new Date(2026, 8, 21), new Date(2000, 0, 1), new Date(2090, 5, 1)]) {
    const st = daeunState(saju, now);
    const y = now.getFullYear();
    const list = saju.daeun;
    if (st.current) {
      ok('current covers year or is last', (y >= st.current.startYear && y <= st.current.endYear) || (st.current === list[list.length - 1] && y > st.current.endYear), [y, st.current]);
      const idx = list.indexOf(st.current);
      ok('next follows current', st.next === (list[idx + 1] ?? null));
    } else {
      ok('before first: no current, next is first', y < list[0].startYear && st.next === list[0], [y, list[0]]);
    }
  }
}

// 십신 daeun consecutive & contiguous
const s0 = calculateSaju({ gender: 'female', year: 1995, month: 6, day: 15, hour: 12, minute: 0, calendarType: 'solar' });
for (let i = 1; i < s0.daeun.length; i++) ok('daeun contiguous', s0.daeun[i].startYear === s0.daeun[i - 1].endYear + 1 && s0.daeun[i].startAge === s0.daeun[i - 1].endAge + 1, [s0.daeun[i - 1], s0.daeun[i]]);

console.log(`verify-flow: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
