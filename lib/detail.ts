import { SajuResult, TenGod, ZHI_HANGUL, ZHI_MAIN_GAN, tenGodOf } from './saju';
import { getContent } from './contentStore';
import { tenGodGroupCounts } from './tenGodGroups';

export type DetailLine = {
  text: string;
  /** Why this paragraph applies, shown as a footnote. */
  basis: string;
  /** The classical passage the paragraph leans on; null where there is none. */
  reference: string | null;
};

/*
 * Phrases from 《淵海子平》 (public domain, zh.wikisource.org/wiki/淵海子平) that the
 * paragraphs in lib/content/detail.ts paraphrase. Each was checked against that text.
 */
const BOOK = '《연해자평》';
const GOD_REFERENCE: Record<TenGod, string> = {
  비견: '論兄弟姊妹 "比肩者，兄弟也"',
  겁재: '論劫財 "主破耗、防小人"',
  식신: '論食神 "主人財厚食豐、腹量寬洪"',
  상관: '論傷官 "傷官主人多才藝、傲物氣高"',
  편재: '論偏財 "偏財者，乃眾人之財也"',
  정재: '論正財 "財要得時，不要財多"',
  편관: '論七殺 "不可便言凶…多有巨富大貴之人"',
  정관: '正官論 "正官乃貴氣之物，大忌刑沖破害"',
  편인: '論倒食 "作事進退悔懶、有始無終"',
  정인: '論印綬 "主人多智慮，兼豐厚"',
};
const MONTH_REFERENCE = '論月令 "月為提綱"';
const DAY_BRANCH_REFERENCE = '"日干為己身，日支為妻妾"';
const WEALTH_REFERENCE = '論正財 "財要得時，不要財多"';

const branchGod = (saju: SajuResult, zhi: string): TenGod => tenGodOf(saju.dayGan, ZHI_MAIN_GAN[zhi]);

/** 성격 보강: the 십신 of the month branch. */
export function personalityDetail(saju: SajuResult): DetailLine {
  const zhi = saju.month.zhi;
  const god = branchGod(saju, zhi);
  return {
    text: getContent().PERSONALITY_BY_MONTH_GOD[god],
    basis: `월지 ${zhi}(${ZHI_HANGUL[zhi]}) · 일간 ${saju.dayGan} 기준 ${god}`,
    reference: `${BOOK} ${MONTH_REFERENCE} · ${GOD_REFERENCE[god]}`,
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
    reference: count === 0 ? null : `${BOOK} ${WEALTH_REFERENCE}`,
  };
}

/** 애정 보강: the 십신 of the day branch (the partner's seat). */
export function loveDetail(saju: SajuResult): DetailLine {
  const zhi = saju.day.zhi;
  const god = branchGod(saju, zhi);
  return {
    text: getContent().LOVE_BY_DAY_GOD[god],
    basis: `일지 ${zhi}(${ZHI_HANGUL[zhi]}) · 일간 ${saju.dayGan} 기준 ${god}`,
    reference: `${BOOK} ${DAY_BRANCH_REFERENCE}`,
  };
}
