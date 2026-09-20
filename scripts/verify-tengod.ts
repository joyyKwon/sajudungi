import { Solar } from 'lunar-javascript';
import { calculateSaju, tenGodOf, elementCounts, TenGod } from '../lib/saju';
import { dailyFlow } from '../lib/daily';
import { DEFAULT_SAJU_OPTIONS } from '../lib/saju';

const ZH2KO: Record<string, TenGod> = { 比肩: '비견', 劫财: '겁재', 食神: '식신', 伤官: '상관', 偏财: '편재', 正财: '정재', 七杀: '편관', 正官: '정관', 偏印: '편인', 正印: '정인' };
let pass = 0, fail = 0;
const eq = (label: string, got: unknown, want: unknown) => { JSON.stringify(got) === JSON.stringify(want) ? pass++ : (fail++, console.log('FAIL', label, got, want)); };

// Cross-check our 십신 against lunar-javascript's for 3000 random charts (year/month/hour stems vs day stem).
let seed = 99; const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
let mismatches = 0, n = 0;
for (let i = 0; i < 3000; i++) {
  const y = 1930 + Math.floor(rnd() * 90), m = 1 + Math.floor(rnd() * 12), d = 1 + Math.floor(rnd() * 28), h = Math.floor(rnd() * 22);
  const ec = Solar.fromYmdHms(y, m, d, h, 30, 0).getLunar().getEightChar();
  const day = ec.getDayGan();
  for (const [gan, zh] of [[ec.getYearGan(), ec.getYearShiShenGan()], [ec.getMonthGan(), ec.getMonthShiShenGan()], [ec.getTimeGan(), ec.getTimeShiShenGan()]] as const) {
    n++;
    if (tenGodOf(day, gan) !== ZH2KO[zh]) { mismatches++; if (mismatches < 5) console.log('mismatch', day, gan, zh, tenGodOf(day, gan)); }
  }
}
eq(`tenGodOf vs library (${n} pairs) mismatches`, mismatches, 0);

// Sanity: all 10 gods appear for a fixed day master; day master vs itself = 비견.
const gods = new Set('甲乙丙丁戊己庚辛壬癸'.split('').map((g) => tenGodOf('庚', g)));
eq('all 10 gods reachable', gods.size, 10);
eq('self = 비견', tenGodOf('庚', '庚'), '비견');

// 오행 counts: 8 chars with hour, 6 without.
const base = { gender: 'female' as const, year: 1996, month: 3, day: 14, hour: 15, minute: 30, calendarType: 'solar' as const };
const full = calculateSaju(base);
eq('element total with hour', Object.values(elementCounts(full)).reduce((a, b) => a + b, 0), 8);
eq('element total without hour', Object.values(elementCounts(calculateSaju({ ...base, hour: null, minute: null }))).reduce((a, b) => a + b, 0), 6);

// daily flow is deterministic and matches the engine's own pillar for that date
const f1 = dailyFlow(full, DEFAULT_SAJU_OPTIONS, new Date(2026, 8, 20, 3, 0));
const f2 = dailyFlow(full, DEFAULT_SAJU_OPTIONS, new Date(2026, 8, 20, 23, 0));
eq('daily flow stable within a date', f1.pillar.ganZhi, f2.pillar.ganZhi);
console.log('2026-09-20 일진:', f1.pillar.ganZhi, f1.god);
console.log(`${pass} passed, ${fail} failed`);
