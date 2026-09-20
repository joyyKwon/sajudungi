import KoreanLunarCalendar from 'korean-lunar-calendar';
import { lunarToSolar, leapMonthOfYear, validateLunarDate } from '../lib/lunar';
import { calculateSaju, BirthInput } from '../lib/saju';

let pass = 0, fail = 0;
const eq = (label: string, got: unknown, want: unknown) => { JSON.stringify(got) === JSON.stringify(want) ? pass++ : (fail++, console.log('FAIL', label, 'got', got, 'want', want)); };
const ok = (label: string, cond: boolean, extra?: unknown) => (cond ? pass++ : (fail++, console.log('FAIL', label, extra ?? '')));

// 1) Round trip through the library's independent solar->lunar direction, every lunar date 1900-2026 (incl. leap months)
let n = 0, bad = 0;
for (let y = 1900; y <= 2026; y++) {
  const leap = leapMonthOfYear(y);
  for (let m = 1; m <= 12; m++) for (const isLeap of [false, true]) {
    if (isLeap && m !== leap) continue;
    for (let d = 1; d <= 30; d++) {
      const s = lunarToSolar(y, m, d, isLeap);
      if (!s) { if (d <= 29) { bad++; console.log('missing day', y, m, d, isLeap); } continue; }
      const back = new KoreanLunarCalendar();
      back.setSolarDate(s.year, s.month, s.day);
      const l = back.getLunarCalendar();
      n++;
      if (l.year !== y || l.month !== m || l.day !== d || !!l.intercalation !== isLeap) bad++;
    }
  }
}
ok(`lunar<->solar round trip (${n} dates)`, bad === 0, bad);

// 2) leap months per year (Korean/KASI, not Chinese: 2012 & 2017 differ)
for (const [y, leap] of [[1995, 8], [1996, 0], [2012, 3], [2017, 5], [2020, 4], [2023, 2], [2025, 6]] as const) eq(`leap month of ${y}`, leapMonthOfYear(y), leap);

// 3) known conversions
eq('1995 윤8월 1일', lunarToSolar(1995, 8, 1, true), { year: 1995, month: 9, day: 25 });
eq('1995 8월 1일', lunarToSolar(1995, 8, 1, false), { year: 1995, month: 8, day: 26 });
eq('1996 1월 25일 = 1996-03-14', lunarToSolar(1996, 1, 25, false), { year: 1996, month: 3, day: 14 });

// 4) validation messages
eq('valid leap', validateLunarDate(1995, 8, 1, true), null);
ok('no leap year', validateLunarDate(1996, 3, 1, true)?.includes('윤달이 없어요') === true);
ok('wrong leap month names the real one', validateLunarDate(2012, 4, 1, true)?.includes('윤3월이에요') === true, validateLunarDate(2012, 4, 1, true));
ok('2017 leap is 5 not 6', validateLunarDate(2017, 6, 1, true) !== null && validateLunarDate(2017, 5, 1, true) === null);
ok('day overflow', validateLunarDate(1995, 8, 31, false)?.includes('31일이 없어요') === true);
ok('leap day overflow', validateLunarDate(1995, 8, 31, true)?.includes('윤8월에는 31일이 없어요') === true, validateLunarDate(1995, 8, 31, true));

// 5) engine: lunar (incl. leap) input == solar input on the converted date
const base: BirthInput = { gender: 'female', year: 1995, month: 8, day: 1, hour: 15, minute: 30, calendarType: 'lunar', isLeapMonth: true };
const lunarLeap = calculateSaju(base);
const solarSame = calculateSaju({ ...base, year: 1995, month: 9, day: 25, calendarType: 'solar', isLeapMonth: undefined });
eq('윤8월1일 pillars == 1995-09-25 pillars', [lunarLeap.year.ganZhi, lunarLeap.month.ganZhi, lunarLeap.day.ganZhi, lunarLeap.hour?.ganZhi], [solarSame.year.ganZhi, solarSame.month.ganZhi, solarSame.day.ganZhi, solarSame.hour?.ganZhi]);
eq('solarDate exposed', lunarLeap.solarDate, { year: 1995, month: 9, day: 25 });
const plain = calculateSaju({ ...base, isLeapMonth: false });
eq('non-leap 8월1일 -> 1995-08-26', plain.solarDate, { year: 1995, month: 8, day: 26 });
ok('leap and non-leap differ', lunarLeap.day.ganZhi !== plain.day.ganZhi || lunarLeap.month.ganZhi !== plain.month.ganZhi);
let threw = false; try { calculateSaju({ ...base, year: 1996, month: 3, isLeapMonth: true }); } catch { threw = true; }
ok('invalid leap month throws', threw);

// 6) property: random lunar dates -> engine agrees with solar input on the converted date
let seed = 21; const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
let mism = 0, cases = 0;
for (let i = 0; i < 1500; i++) {
  const y = 1920 + Math.floor(rnd() * 105), m = 1 + Math.floor(rnd() * 12), d = 1 + Math.floor(rnd() * 29);
  const leap = leapMonthOfYear(y) === m && rnd() > 0.5;
  const s = lunarToSolar(y, m, d, leap); if (!s) continue;
  const hour = rnd() > 0.2 ? Math.floor(rnd() * 24) : null;
  const common = { gender: 'male' as const, hour, minute: hour === null ? null : Math.floor(rnd() * 60) };
  const a = calculateSaju({ ...common, year: y, month: m, day: d, calendarType: 'lunar', isLeapMonth: leap });
  const b = calculateSaju({ ...common, year: s.year, month: s.month, day: s.day, calendarType: 'solar' });
  cases++;
  if (JSON.stringify([a.year, a.month, a.day, a.hour, a.daeun]) !== JSON.stringify([b.year, b.month, b.day, b.hour, b.daeun])) mism++;
}
eq(`engine lunar==solar on converted date (${cases} random cases)`, mism, 0);
console.log(`${pass} passed, ${fail} failed`);
