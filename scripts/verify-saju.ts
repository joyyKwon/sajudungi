import { calculateSaju, SajuOptions, BirthInput } from '../lib/saju';
let pass = 0, fail = 0;
const eq = (label: string, got: unknown, want: unknown) => { const ok = JSON.stringify(got) === JSON.stringify(want); ok ? pass++ : (fail++, console.log('FAIL', label, 'got', got, 'want', want)); };
const base: BirthInput = { gender: 'female', year: 1996, month: 3, day: 14, hour: 12, minute: 0, calendarType: 'solar' };
const ON: SajuOptions = { longitudeCorrection: true, jasi: 'yajasi' };
const OFF: SajuOptions = { longitudeCorrection: false, jasi: 'yajasi' };
const OFF_JO: SajuOptions = { longitudeCorrection: false, jasi: 'jojasi' };
const ON_JO: SajuOptions = { longitudeCorrection: true, jasi: 'jojasi' };
const run = (o: Partial<BirthInput>, opt: SajuOptions) => calculateSaju({ ...base, ...o }, opt);
const zhi = (o: Partial<BirthInput>, opt: SajuOptions) => run(o, opt).hour?.zhi;
const dayOf = (o: Partial<BirthInput>, opt: SajuOptions) => run(o, opt).day.ganZhi;

const d13 = dayOf({ day: 13 }, ON), d14 = dayOf({ day: 14 }, ON), d15 = dayOf({ day: 15 }, ON);
console.log('reference day pillars 3/13, 3/14, 3/15:', d13, d14, d15);

// A/B: 진태양시 −30분 경계 (未 13-15, 申 15-17)
eq('15:10 ON -> 未', zhi({ hour: 15, minute: 10 }, ON), '未');
eq('15:29 ON -> 未', zhi({ hour: 15, minute: 29 }, ON), '未');
eq('15:30 ON -> 申', zhi({ hour: 15, minute: 30 }, ON), '申');
eq('15:10 OFF -> 申', zhi({ hour: 15, minute: 10 }, OFF), '申');
eq('14:59 OFF -> 未', zhi({ hour: 14, minute: 59 }, OFF), '未');
eq('13:30 OFF -> 未', zhi({ hour: 13, minute: 30 }, OFF), '未');
eq('13:29 ON -> 午', zhi({ hour: 13, minute: 29 }, ON), '午');

// C: 자시 / 야자시·조자시 (ON: 23:30 KST = 23:00 보정시)
eq('23:10 ON -> 亥', zhi({ hour: 23, minute: 10 }, ON), '亥');
eq('23:29 ON -> 亥', zhi({ hour: 23, minute: 29 }, ON), '亥');
eq('23:30 ON -> 子', zhi({ hour: 23, minute: 30 }, ON), '子');
eq('23:40 ON 야자시 day = 3/14', dayOf({ hour: 23, minute: 40 }, ON), d14);
eq('23:40 ON 조자시 day = 3/15', dayOf({ hour: 23, minute: 40 }, ON_JO), d15);
eq('00:20 ON 야자시 day = 3/13 (still 야자시)', dayOf({ hour: 0, minute: 20 }, ON), d13);
eq('00:20 ON 조자시 day = 3/14', dayOf({ hour: 0, minute: 20 }, ON_JO), d14);
eq('00:29 ON 야자시 day = 3/13', dayOf({ hour: 0, minute: 29 }, ON), d13);
eq('00:30 ON 야자시 day = 3/14', dayOf({ hour: 0, minute: 30 }, ON), d14);
eq('00:20 ON zhi 子', zhi({ hour: 0, minute: 20 }, ON), '子');
eq('23:10 OFF -> 子', zhi({ hour: 23, minute: 10 }, OFF), '子');
eq('22:59 OFF -> 亥', zhi({ hour: 22, minute: 59 }, OFF), '亥');
eq('23:10 OFF 야자시 day = 3/14', dayOf({ hour: 23, minute: 10 }, OFF), d14);
eq('23:10 OFF 조자시 day = 3/15', dayOf({ hour: 23, minute: 10 }, OFF_JO), d15);
eq('00:10 OFF 야자시 day = 3/14', dayOf({ hour: 0, minute: 10 }, OFF), d14);
// 시주 must be identical between 야자시/조자시 (only the day differs)
eq('23:40 hour pillar same in both', run({ hour: 23, minute: 40 }, ON).hour?.ganZhi, run({ hour: 23, minute: 40 }, ON_JO).hour?.ganZhi);
console.log('23:40 야자시:', run({ hour: 23, minute: 40 }, ON).day.ganZhi, run({ hour: 23, minute: 40 }, ON).hour?.ganZhi, '| 조자시:', run({ hour: 23, minute: 40 }, ON_JO).day.ganZhi, run({ hour: 23, minute: 40 }, ON_JO).hour?.ganZhi);

// E/F: 서머타임 · 127.5° 시기
const dst88 = run({ year: 1988, month: 6, day: 1, hour: 12, minute: 0 }, ON);
eq('1988 DST note', dst88.basis.notes.includes('서머타임 −60분 반영'), true);
eq('1988-06-01 12:00 ON -> 巳 (utc02:00 +8:30 = 10:30)', dst88.hour?.zhi, '巳');
eq('1988-06-01 12:00 OFF -> 午 (11:00)', run({ year: 1988, month: 6, day: 1, hour: 12, minute: 0 }, OFF).hour?.zhi, '午');
const a57 = run({ year: 1957, month: 6, day: 15, hour: 12, minute: 0 }, ON);
eq('1957-06-15 notes', a57.basis.notes, ['서머타임 −60분 반영', '동경 127.5° 표준시 시기 반영']);
eq('1957-12-15 notes (127.5 only)', run({ year: 1957, month: 12, day: 15, hour: 12, minute: 0 }, ON).basis.notes, ['동경 127.5° 표준시 시기 반영']);
eq('1957-12-15 12:00 -> 午', zhi({ year: 1957, month: 12, day: 15, hour: 12, minute: 0 }, ON), '午');
eq('1962-01-10 12:00 no notes besides 보정', run({ year: 1962, month: 1, day: 10, hour: 12, minute: 0 }, ON).basis.notes, ['진태양시 −30분 보정']);

// G: 입춘 경계는 실제 순간 기준 (옵션과 무관)
for (const opt of [ON, OFF, ON_JO]) {
  const before = run({ year: 2024, month: 2, day: 4, hour: 17, minute: 20 }, opt);
  const after = run({ year: 2024, month: 2, day: 4, hour: 17, minute: 35 }, opt);
  eq('입춘 before', [before.year.ganZhi, before.month.ganZhi], ['癸卯', '乙丑']);
  eq('입춘 after', [after.year.ganZhi, after.month.ganZhi], ['甲辰', '丙寅']);
}

// I/J: 음력, 시간 모름
eq('lunar 1996-1-25 15:30 == solar 3/14 15:30', calculateSaju({ ...base, calendarType: 'lunar', month: 1, day: 25, hour: 15, minute: 30 }, ON).hour?.ganZhi, run({ hour: 15, minute: 30 }, ON).hour?.ganZhi);
const unk = run({ hour: null, minute: null }, ON);
eq('unknown hour -> null', unk.hour, null);
eq('unknown hour day = noon day', unk.day.ganZhi, d14);

// H: property test — OFF mode, non-DST / non-127.5 years
let seed = 12345; const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
let bad = 0, n = 0;
for (let i = 0; i < 3000; i++) {
  const year = 1962 + Math.floor(rnd() * 58); if (year === 1987 || year === 1988) continue;
  const month = 1 + Math.floor(rnd() * 12), day = 1 + Math.floor(rnd() * 28);
  const hour = Math.floor(rnd() * 24), minute = Math.floor(rnd() * 60);
  const o = { year, month, day, hour, minute };
  const r = run(o, OFF), rj = run(o, OFF_JO);
  const noon = run({ year, month, day, hour: 12, minute: 0 }, OFF).day.ganZhi;
  const nextDate = new Date(Date.UTC(year, month - 1, day + 1));
  const next = run({ year: nextDate.getUTCFullYear(), month: nextDate.getUTCMonth() + 1, day: nextDate.getUTCDate(), hour: 12, minute: 0 }, OFF).day.ganZhi;
  const branchIdx = Math.floor((hour * 60 + minute + 60) / 120) % 12;
  const expectedZhi = '子丑寅卯辰巳午未申酉戌亥'[branchIdx];
  const expDayYa = hour === 23 ? noon : noon; // 야자시: 23시대도 당일
  const expDayJo = hour === 23 ? next : noon;
  n++;
  if (r.hour?.zhi !== expectedZhi || r.day.ganZhi !== expDayYa || rj.day.ganZhi !== expDayJo) { bad++; if (bad < 6) console.log('PROP FAIL', o, r.hour?.zhi, expectedZhi, r.day.ganZhi, expDayYa, rj.day.ganZhi, expDayJo); }
}
eq(`property sweep (${n} cases) violations`, bad, 0);
console.log(`\n${pass} passed, ${fail} failed`);
