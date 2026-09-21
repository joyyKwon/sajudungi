import { SajuOptions, WuXing, calculateSaju } from './saju';
import type { Person } from './people';

export type PersonSummary = {
  /** Day stem (일간), e.g. 丁. */
  gan: string;
  ganElement: WuXing;
  iljuHangul: string;
  iljuHanja: string;
};

/** Enough of the chart to label a list row; null if the saved date can't be calculated. */
export function summarizePerson(p: Person, options: SajuOptions): PersonSummary | null {
  try {
    const s = calculateSaju(p, options);
    return { gan: s.dayGan, ganElement: s.dayGanElement, iljuHangul: s.day.hangul, iljuHanja: s.day.ganZhi };
  } catch {
    return null;
  }
}

/** "1992.11.27", lunar dates get "(음)" or "(음·윤)". */
export function shortBirthDate(p: Pick<Person, 'year' | 'month' | 'day' | 'calendarType' | 'isLeapMonth'>): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const suffix = p.calendarType === 'lunar' ? (p.isLeapMonth ? ' (음·윤)' : ' (음)') : '';
  return `${p.year}.${pad(p.month)}.${pad(p.day)}${suffix}`;
}
