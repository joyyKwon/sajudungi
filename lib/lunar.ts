import KoreanLunarCalendar from 'korean-lunar-calendar';

// Lunar dates are converted with the Korean (KASI) calendar rather than the
// Chinese one used elsewhere in the engine: the two disagree on month lengths
// in ~1/3 of years and on the leap month itself in some (e.g. 2012, 2017).

export type SolarDate = { year: number; month: number; day: number };

/** Solar date for a Korean lunar date, or null if that lunar date doesn't exist. */
export function lunarToSolar(year: number, month: number, day: number, isLeapMonth: boolean): SolarDate | null {
  const cal = new KoreanLunarCalendar();
  if (!cal.setLunarDate(year, month, day, isLeapMonth)) return null;
  const { year: y, month: m, day: d } = cal.getSolarCalendar();
  return { year: y, month: m, day: d };
}

/** The leap month (1-12) of a lunar year, or 0 when the year has none. */
export function leapMonthOfYear(year: number): number {
  const cal = new KoreanLunarCalendar();
  for (let m = 1; m <= 12; m++) {
    if (cal.setLunarDate(year, m, 1, true)) return m;
  }
  return 0;
}

/** Human-readable reason a lunar date is invalid, or null when it's fine. */
export function validateLunarDate(year: number, month: number, day: number, isLeapMonth: boolean): string | null {
  if (lunarToSolar(year, month, day, isLeapMonth)) return null;

  if (isLeapMonth) {
    const leap = leapMonthOfYear(year);
    if (leap !== month) {
      return leap === 0
        ? `음력 ${year}년에는 윤달이 없어요.`
        : `음력 ${year}년에는 윤${month}월이 없어요. (윤달은 윤${leap}월이에요)`;
    }
  }
  const label = `${isLeapMonth ? '윤' : ''}${month}월`;
  return lunarToSolar(year, month, 1, isLeapMonth)
    ? `음력 ${year}년 ${label}에는 ${day}일이 없어요.`
    : `음력 ${year}년 ${label}을 찾을 수 없어요.`;
}
