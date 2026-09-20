import { calculateSaju, Pillar, SajuOptions, SajuResult, TenGod, tenGodOf } from './saju';

export type DailyFlow = {
  pillar: Pillar;
  god: TenGod;
};

/**
 * Today's 일진 (day pillar) and how its heavenly stem relates to the user's
 * day master. Noon is used so the result doesn't flip around the 00:00/00:30
 * day boundary while the app is open.
 */
export function dailyFlow(saju: SajuResult, options: SajuOptions, now: Date = new Date()): DailyFlow {
  const today = calculateSaju(
    { gender: 'female', year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate(), hour: 12, minute: 0, calendarType: 'solar' },
    options,
  ).day;
  return { pillar: today, god: tenGodOf(saju.dayGan, today.gan) };
}
