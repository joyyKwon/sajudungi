import { SajuResult, ZHI_MAIN_GAN, pillarsOf, tenGodOf } from './saju';
import { GROUP_ORDER, TenGodGroup } from './content/tenGodGroups';
import { getContent } from './contentStore';

export type GroupCounts = Record<TenGodGroup, number>;

/**
 * How many of the chart's characters fall into each 십신 group, relative to the
 * day master: the stems of the year/month/hour pillars plus the main hidden
 * stem (본기) of every branch. The day stem itself ("나") is not counted.
 */
export function tenGodGroupCounts(saju: SajuResult): GroupCounts {
  const { TEN_GODS } = getContent();
  const counts: GroupCounts = { 비겁: 0, 식상: 0, 재성: 0, 관성: 0, 인성: 0 };
  for (const { key, pillar } of pillarsOf(saju)) {
    if (key !== 'day') counts[TEN_GODS[tenGodOf(saju.dayGan, pillar.gan)].group] += 1;
    counts[TEN_GODS[tenGodOf(saju.dayGan, ZHI_MAIN_GAN[pillar.zhi])].group] += 1;
  }
  return counts;
}

export type GroupAnalysis = {
  /** Groups that stand out (most characters, at least two). Empty when balanced. */
  dominant: TenGodGroup[];
  headline: string;
  insights: string[];
};

export function analyzeGroups(counts: GroupCounts): GroupAnalysis {
  const { GROUP_BALANCED, GROUP_INFO } = getContent();
  const max = Math.max(...GROUP_ORDER.map((g) => counts[g]));
  const dominant = max >= 2 ? GROUP_ORDER.filter((g) => counts[g] === max) : [];
  const balanced = dominant.length === 0 || dominant.length === GROUP_ORDER.length;

  const headline = balanced
    ? GROUP_BALANCED
    : `${dominant.join('·')}이 중심이에요 · ${dominant.map((g) => GROUP_INFO[g].headline).join(' / ')}`;

  const insights: string[] = [];
  for (const g of GROUP_ORDER) {
    if (counts[g] >= 3) insights.push(GROUP_INFO[g].strong);
    else if (counts[g] === 0) insights.push(GROUP_INFO[g].lacking);
  }
  return { dominant: balanced ? [] : dominant, headline, insights };
}
