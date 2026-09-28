import { SajuResult, TenGod, ZHI_HANGUL, ZHI_MAIN_GAN, tenGodOf } from './saju';
import { getContent } from './contentStore';
import { tenGodGroupCounts } from './tenGodGroups';

export type DetailLine = {
  text: string;
  /** Why this paragraph applies, shown as a footnote. */
  basis: string;
};

const branchGod = (saju: SajuResult, zhi: string): TenGod => tenGodOf(saju.dayGan, ZHI_MAIN_GAN[zhi]);

/** 성격 보강: the 십신 of the month branch. */
export function personalityDetail(saju: SajuResult): DetailLine {
  const zhi = saju.month.zhi;
  const god = branchGod(saju, zhi);
  return {
    text: getContent().PERSONALITY_BY_MONTH_GOD[god],
    basis: `월지 ${zhi}(${ZHI_HANGUL[zhi]}) · 일간 ${saju.dayGan} 기준 ${god}`,
  };
}

/** 재물 보강: how many 재성 characters the chart shows. */
export function wealthDetail(saju: SajuResult): DetailLine {
  const count = tenGodGroupCounts(saju).재성;
  const { WEALTH_BY_JAESEONG } = getContent();
  const text = count === 0 ? WEALTH_BY_JAESEONG.none : count <= 2 ? WEALTH_BY_JAESEONG.some : WEALTH_BY_JAESEONG.many;
  return {
    text,
    basis: `원국의 재성 ${count}개 · 일간을 뺀 천간과 지지 본기운 기준${saju.hour ? '' : ', 시주 제외'}`,
  };
}

/** 애정 보강: the 십신 of the day branch (the partner's seat). */
export function loveDetail(saju: SajuResult): DetailLine {
  const zhi = saju.day.zhi;
  const god = branchGod(saju, zhi);
  return {
    text: getContent().LOVE_BY_DAY_GOD[god],
    basis: `일지 ${zhi}(${ZHI_HANGUL[zhi]}) · 일간 ${saju.dayGan} 기준 ${god}`,
  };
}
