import { DaeunEntry, GAN_HANGUL, SajuResult, TenGod, WolunEntry, ZHI_HANGUL, ZHI_MAIN_GAN, ganZhiHangul, tenGodOf, yearGanZhi } from './saju';
import type { FlowTheme } from './content/flow';
import { getContent } from './contentStore';
import { eunneun, iyeyo } from './interpret';

export type FlowInfo = {
  /** Short label, e.g. "2026년 세운" or "24~33세 대운". */
  label: string;
  ganZhi: string;
  hangul: string;
  ganGod: TenGod;
  zhiGod: TenGod;
  /** Plain-language title, e.g. "승부욕이 살아나는 해". */
  title: string;
  /** The term for it, e.g. "겁재(劫財)의 해" — shown as a small tag, not in the body. */
  godLabel: string;
  body: string;
  /** Secondary note about the branch's hidden-stem influence, without terms. */
  note: string;
  /** Why this reading follows from the chart; this is where the 십신 terms live. */
  basis: string;
};

const PERIOD_WORD = { year: '해', month: '달', daeun: '시기' } as const;

function build(saju: SajuResult, ganZhi: string, kind: 'year' | 'month' | 'daeun', label: string): FlowInfo {
  const { TEN_GODS, YEAR_THEME, MONTH_THEME, DAEUN_THEME, FLOW_UNDERTONE } = getContent();
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
    title: theme[ganGod].title,
    godLabel: `${ganGod}(${TEN_GODS[ganGod].hanja})의 ${PERIOD_WORD[kind]}`,
    body: theme[ganGod].body,
    note: FLOW_UNDERTONE[zhiGod],
    basis: `${gan}(${GAN_HANGUL[gan]})${eunneun(GAN_HANGUL[gan])} 나(${saju.dayGan})에게 ${ganGod}, ${zhi}(${ZHI_HANGUL[zhi]}) 속 기운은 ${zhiGod}${iyeyo(zhiGod)}.`,
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
