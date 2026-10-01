import { SajuResult, ZHI_HANGUL, ZHI_MAIN_GAN, tenGodOf } from './saju';
import { getContent } from './contentStore';
import { GROUP_ORDER, TenGodGroup } from './content/tenGodGroups';
import { analyzeGroups, tenGodGroupCounts } from './tenGodGroups';

export type CareerReading = {
  keywords: string[];
  /** One entry per standout 십신 group (at most two); a single balanced entry when none stands out. */
  fields: { group: TenGodGroup | null; body: string; jobs: string[] }[];
  fieldsBasis: string;
  style: { text: string; basis: string };
  /** Groups the chart doesn't show at all (at most two). */
  tips: { group: TenGodGroup; text: string }[];
};

const list = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);

export function careerOf(saju: SajuResult): CareerReading {
  const { CAREER_BY_GROUP, CAREER_BALANCED, CAREER_STYLE_BY_MONTH_GOD, CAREER_TIP_BY_LACKING } = getContent();
  const counts = tenGodGroupCounts(saju);
  const dominant = analyzeGroups(counts).dominant.slice(0, 2);

  const sources = dominant.length ? dominant.map((g) => ({ group: g as TenGodGroup | null, field: CAREER_BY_GROUP[g] })) : [{ group: null, field: CAREER_BALANCED }];
  // Interleave each source's keywords so two standout groups both show up in the top three.
  const keywordLists = sources.map((s) => list(s.field.keywords));
  const keywords: string[] = [];
  for (let i = 0; keywords.length < 3 && i < 3; i++) {
    for (const kws of keywordLists) if (kws[i] && !keywords.includes(kws[i]) && keywords.length < 3) keywords.push(kws[i]);
  }

  const monthZhi = saju.month.zhi;
  const monthGod = tenGodOf(saju.dayGan, ZHI_MAIN_GAN[monthZhi]);
  const lacking = GROUP_ORDER.filter((g) => counts[g] === 0).slice(0, 2);

  return {
    keywords,
    fields: sources.map((s) => ({ group: s.group, body: s.field.body, jobs: list(s.field.jobs) })),
    fieldsBasis: dominant.length
      ? `원국에서 ${dominant.map((g) => `${g} ${counts[g]}개`).join(', ')}로 가장 많음`
      : '다섯 십신 그룹이 고르게 분포',
    style: {
      text: CAREER_STYLE_BY_MONTH_GOD[monthGod],
      basis: `월지 ${monthZhi}(${ZHI_HANGUL[monthZhi]}) · 일간 ${saju.dayGan} 기준 ${monthGod}`,
    },
    tips: lacking.map((g) => ({ group: g, text: CAREER_TIP_BY_LACKING[g] })),
  };
}
