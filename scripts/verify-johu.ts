// 조후 (궁통보감): table completeness and sourcing, anchor cells, and the per-chart reading.
import { calculateSaju, yearGanZhi, ZHI_MAIN_GAN } from '../lib/saju';
import { JOHU_INTRO, JOHU_ROLE, JOHU_SEASON } from '../lib/content/johu';
import { JOHU_TABLE, johuOf } from '../lib/johu';

let pass = 0, fail = 0;
const ok = (label: string, cond: boolean, extra?: unknown) => (cond ? pass++ : (fail++, console.log('FAIL', label, extra ?? '')));

const BANNED = ['죽', '사망', '이혼', '재앙', '불행', '질병', '파산', '망한', '저주', '큰일', '반드시', '절대'];
const clean = (s: string) => !/undefined|NaN|null|\[object/.test(s) && !BANNED.some((w) => s.includes(w));

const GAN = '甲乙丙丁戊己庚辛壬癸';
const ZHI = '子丑寅卯辰巳午未申酉戌亥';

// Table
ok('10 day stems', Object.keys(JOHU_TABLE).sort().join('') === [...GAN].sort().join(''));
for (const g of GAN) {
  ok(`${g}: 12 months`, Object.keys(JOHU_TABLE[g]).sort().join('') === [...ZHI].sort().join(''));
  for (const z of ZHI) {
    const [stems, quote] = JOHU_TABLE[g][z];
    ok(`${g}${z}: 1–3 valid stems`, stems.length >= 1 && stems.length <= 3 && [...stems].every((s) => GAN.includes(s)), stems);
    ok(`${g}${z}: no repeats`, new Set(stems).size === stems.length, stems);
    ok(`${g}${z}: every stem is in the quoted source`, [...stems].every((s) => quote.includes(s)), [stems, quote]);
    ok(`${g}${z}: quote is short`, quote.length >= 4 && quote.length <= 40, quote);
  }
}
// Anchor cells that every reading of 궁통보감 agrees on.
const primary = (g: string, z: string) => JOHU_TABLE[g][z][0][0];
ok('甲 寅 → 丙 first', primary('甲', '寅') === '丙');
ok('乙 子 → 丙', primary('乙', '子') === '丙');
ok('丙 午 → 壬', primary('丙', '午') === '壬');
ok('丁 winter → 甲', ['亥', '子', '丑'].every((z) => primary('丁', z) === '甲'));
ok('庚 午 → 壬', primary('庚', '午') === '壬');
ok('壬 午 → 癸', primary('壬', '午') === '癸');
ok('癸 子 → 丙', primary('癸', '子') === '丙');
ok('甲 辰 has no 丁 (三月無用丁之法)', !JOHU_TABLE['甲']['辰'][0].includes('丁'));

// Content
ok('12 seasons', Object.keys(JOHU_SEASON).sort().join('') === [...ZHI].sort().join(''));
for (const z of ZHI) ok(`season ${z}`, JOHU_SEASON[z].title.length >= 2 && JOHU_SEASON[z].body.length >= 25 && clean(JOHU_SEASON[z].title + JOHU_SEASON[z].body));
ok('10 roles', Object.keys(JOHU_ROLE).length === 10 && [...GAN].every((g) => JOHU_ROLE[g]?.length >= 20 && clean(JOHU_ROLE[g])));
ok('intro', JOHU_INTRO.includes('궁통보감') && clean(JOHU_INTRO));

// Worked example: 1995-06-15 12시 = 乙亥 壬午 丁丑 丙午 → 五月丁火 needs 壬 then 庚; 壬 is the month stem.
const A = calculateSaju({ gender: 'female', year: 1995, month: 6, day: 15, hour: 12, minute: 0, calendarType: 'solar' });
const a = johuOf(A, new Date(2026, 8, 28));
ok('A primary 壬, visible', a.primary.gan === '壬' && a.primary.presence === 'visible', a.primary);
ok('A others 庚, absent', a.others.map((o) => o.gan).join() === '庚' && a.others[0].presence === 'absent', a.others);
ok('A source', a.source.startsWith('《궁통보감》 五月丁火'), a.source);
ok('A timing: next 壬 year is 2032 (壬子)', a.timingLine === '다음 壬(임)의 해는 2032년(壬子)이에요.', a.timingLine);
ok('A season 한여름', a.seasonTitle === '한여름');

// Random charts
let seed = 31; const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
for (let i = 0; i < 2000; i++) {
  const withHour = rnd() > 0.25;
  const s = calculateSaju({
    gender: rnd() > 0.5 ? 'male' : 'female', year: 1930 + Math.floor(rnd() * 90), month: 1 + Math.floor(rnd() * 12), day: 1 + Math.floor(rnd() * 28),
    hour: withHour ? Math.floor(rnd() * 24) : null, minute: withHour ? 0 : null, calendarType: 'solar',
  });
  const now = new Date(2000 + Math.floor(rnd() * 40), 5, 1);
  const r = johuOf(s, now);
  const [stems] = JOHU_TABLE[s.dayGan][s.month.zhi];
  ok('stems follow the table', [r.primary, ...r.others].map((x) => x.gan).join('') === stems);
  const visible = [s.year.gan, s.month.gan, s.hour?.gan].filter(Boolean);
  const branches = [s.year.zhi, s.month.zhi, s.day.zhi, s.hour?.zhi].filter(Boolean) as string[];
  for (const x of [r.primary, ...r.others]) {
    const expected = visible.includes(x.gan) ? 'visible' : branches.some((z) => ZHI_MAIN_GAN[z] === x.gan) ? 'hidden' : 'absent';
    ok('presence', x.presence === expected, [x, visible, branches]);
  }
  const m = r.timingLine.match(/(\d{4})년/);
  const year = m ? Number(m[1]) : NaN;
  ok('timing year has the needed stem and is within 10 years', yearGanZhi(year)[0] === r.primary.gan && year >= now.getFullYear() && year < now.getFullYear() + 10, r.timingLine);
  ok('reading text clean', clean(r.seasonBody + r.presenceLine + r.timingLine + r.primary.role + r.others.map((o) => o.role).join('')));
}

console.log(`verify-johu: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
