import { GAN_ELEMENT, GAN_HANGUL, PillarKey, SajuResult, WuXing, ZHI_ELEMENT, ZHI_HANGUL, ZHI_MAIN_GAN, elementCounts, pillarsOf, tenGodOf } from './saju';
import { getContent } from './contentStore';
import { ELEMENT_HANGUL } from './sajuContent';

const hasFinalConsonant = (word: string) => {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  return code >= 0 && code <= 11171 && code % 28 !== 0;
};
/** 이에요 / 예요 attached to a Korean word. */
export const iyeyo = (word: string) => (hasFinalConsonant(word) ? '이에요' : '예요');

export const ELEMENT_ORDER: WuXing[] = ['wood', 'fire', 'earth', 'metal', 'water'];

/** Explanation for one pillar: what it stands for and why it reads the way it does. */
export function interpretPillar(saju: SajuResult, key: PillarKey): string {
  const { TEN_GODS, ILGAN, ILJU, PILLAR_INFO } = getContent();
  const entry = pillarsOf(saju).find((p) => p.key === key);
  if (!entry) return '';
  const { pillar } = entry;
  const dayGan = saju.day.gan;
  const mainGan = ZHI_MAIN_GAN[pillar.zhi];
  const zhiGod = tenGodOf(dayGan, mainGan);
  const ganEl = ELEMENT_HANGUL[GAN_ELEMENT[pillar.gan]];
  const zhiEl = ELEMENT_HANGUL[ZHI_ELEMENT[pillar.zhi]];
  const zhiLine = `속기운은 ${mainGan}(${GAN_HANGUL[mainGan]})이고 나에게 ${zhiGod}${iyeyo(zhiGod)}.`;

  if (key === 'day') {
    const ilgan = ILGAN[pillar.gan];
    return [
      ILJU[pillar.ganZhi],
      `· 일간 ${pillar.gan}(${GAN_HANGUL[pillar.gan]}, ${ganEl}): 사주 해석의 중심이 되는 '나'예요. ${ilgan.summary}.`,
      `· 일지 ${pillar.zhi}(${ZHI_HANGUL[pillar.zhi]}, ${zhiEl}): 내 마음자리이자 배우자 자리예요. ${zhiLine} ${TEN_GODS[zhiGod].meaning}.`,
    ].join('\n');
  }

  const ganGod = tenGodOf(dayGan, pillar.gan);
  const info = PILLAR_INFO[key];
  return [
    `${info.label}(${info.meaning})`,
    `· 천간 ${pillar.gan}(${GAN_HANGUL[pillar.gan]}, ${ganEl}): 나에게 ${ganGod}${iyeyo(ganGod)}. ${TEN_GODS[ganGod].meaning}.`,
    `· 지지 ${pillar.zhi}(${ZHI_HANGUL[pillar.zhi]}, ${zhiEl}): ${zhiLine} ${TEN_GODS[zhiGod].meaning}.`,
  ].join('\n');
}

/** Comments on missing (0) or strong (3+) elements among the visible characters. */
export function elementInsights(saju: SajuResult): string[] {
  const { ELEMENT_BALANCED, ELEMENT_LACKING, ELEMENT_STRONG } = getContent();
  const counts = elementCounts(saju);
  const lines: string[] = [];
  for (const el of ELEMENT_ORDER) {
    if (counts[el] === 0) lines.push(ELEMENT_LACKING[el]);
    else if (counts[el] >= 3) lines.push(ELEMENT_STRONG[el]);
  }
  return lines.length > 0 ? lines : [ELEMENT_BALANCED];
}
