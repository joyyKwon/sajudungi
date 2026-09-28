import { DaeunEntry, GAN_HANGUL, SajuResult, TenGod, WolunEntry, ZHI_HANGUL, ZHI_MAIN_GAN, ganZhiHangul, tenGodOf, yearGanZhi } from './saju';
import type { FlowTheme } from './content/flow';
import { getContent } from './contentStore';
import { iyeyo } from './interpret';

export type FlowInfo = {
  /** Short label, e.g. "2026년 세운" or "24~33세 대운". */
  label: string;
  ganZhi: string;
  hangul: string;
  ganGod: TenGod;
  zhiGod: TenGod;
  title: string;
  body: string;
  /** Secondary note about the branch's hidden-stem influence. */
  note: string;
  /** Why this reading follows from the chart. */
  basis: string;
};

const PERIOD_WORD = { year: '해', month: '달', daeun: '시기' } as const;

function build(saju: SajuResult, ganZhi: string, kind: 'year' | 'month' | 'daeun', label: string): FlowInfo {
  const { TEN_GODS, YEAR_THEME, MONTH_THEME, DAEUN_THEME } = getContent();
  const theme: Record<TenGod, FlowTheme> = { year: YEAR_THEME, month: MONTH_THEME, daeun: DAEUN_THEME }[kind];
  const [gan, zhi] = [ganZhi[0], ganZhi[1]];
  const ganGod = tenGodOf(saju.dayGan, gan);
  const mainGan = ZHI_MAIN_GAN[zhi];
  const zhiGod = tenGodOf(saju.dayGan, mainGan);
  return {
    label,
    ganZhi,
    hangul: ganZhiHangul(ganZhi),
    ganGod,
    zhiGod,
    title: `${ganGod}(${TEN_GODS[ganGod].hanja})의 ${PERIOD_WORD[kind]} · ${theme[ganGod].title}`,
    body: theme[ganGod].body,
    note: `지지 ${zhi}(${ZHI_HANGUL[zhi]})의 속기운은 ${zhiGod}${iyeyo(zhiGod)}. ${TEN_GODS[zhiGod].meaning} 쪽 영향도 함께 있어요.`,
    basis: `천간 ${gan}(${GAN_HANGUL[gan]})은 내 일간 ${saju.dayGan}(${GAN_HANGUL[saju.dayGan]})에게 ${ganGod}${iyeyo(ganGod)}.`,
  };
}

/** 세운: how the given calendar year reads for this chart. */
export function yearFlow(saju: SajuResult, year: number): FlowInfo {
  return build(saju, yearGanZhi(year), 'year', `${year}년 세운`);
}

/** 월운: how one month (절입 to 절입) reads for this chart. */
export function monthFlow(saju: SajuResult, entry: WolunEntry): FlowInfo {
  return build(saju, entry.ganZhi, 'month', `${entry.calendarYear}년 ${entry.month}월 월운`);
}

/** 대운: how a 10-year cycle reads for this chart. */
export function daeunFlow(saju: SajuResult, entry: DaeunEntry): FlowInfo {
  return build(saju, entry.ganZhi, 'daeun', `${entry.startAge}~${entry.endAge}세 대운`);
}

export type DaeunState = {
  /** The cycle covering `now`, or null before the first cycle starts. */
  current: DaeunEntry | null;
  /** The cycle that follows (or the first one, when none has started yet). */
  next: DaeunEntry | null;
};

export function daeunState(saju: SajuResult, now: Date = new Date()): DaeunState {
  const year = now.getFullYear();
  const list = saju.daeun;
  if (list.length === 0) return { current: null, next: null };

  const index = list.findIndex((d) => year >= d.startYear && year <= d.endYear);
  if (index >= 0) return { current: list[index], next: list[index + 1] ?? null };
  if (year < list[0].startYear) return { current: null, next: list[0] };
  return { current: list[list.length - 1], next: null };
}
