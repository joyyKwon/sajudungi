import { calculateSaju, tenGodOf, yearGanZhi, SajuResult } from '../lib/saju';
import { TEN_GODS } from '../lib/content/tenGods';
import { DAEUN_THEME, YEAR_THEME } from '../lib/content/flow';
import { GROUP_BALANCED, GROUP_INFO, GROUP_ORDER } from '../lib/content/tenGodGroups';
import { analyzeGroups, tenGodGroupCounts, GroupCounts } from '../lib/tenGodGroups';
import { daeunFlow, daeunState, yearFlow } from '../lib/flow';

let pass = 0, fail = 0;
const ok = (label: string, cond: boolean, extra?: unknown) => (cond ? pass++ : (fail++, console.log('FAIL', label, extra ?? '')));

const BANNED = ['죽', '사망', '이혼', '재앙', '불행', '질병', '파산', '망한', '저주', '큰일', '반드시', '절대'];
const clean = (s: string) => !/undefined|NaN|null|\[object/.test(s) && !BANNED.some((w) => s.includes(w));

// Content completeness
const GODS = Object.keys(TEN_GODS);
ok('10 gods', GODS.length === 10);
for (const g of GODS) {
  for (const [name, theme] of [['YEAR', YEAR_THEME], ['DAEUN', DAEUN_THEME]] as const) {
    const t = (theme as Record<string, { title: string; body: string }>)[g];
    ok(`${name}_THEME ${g}`, !!t && t.title.length >= 4 && t.body.length >= 30 && clean(t.title + t.body), t);
  }
}
ok('YEAR bodies unique', new Set(GODS.map((g) => (YEAR_THEME as any)[g].body)).size === 10);
ok('DAEUN bodies unique', new Set(GODS.map((g) => (DAEUN_THEME as any)[g].body)).size === 10);
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
    ok('year flow text', clean(f.title + f.body + f.note + f.basis) && f.title.includes(f.ganGod) && f.note.includes(f.zhiGod));
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
