import { getContent } from './contentStore';
import { ELEMENT_HANGUL, ELEMENT_HANJA } from './sajuContent';
import { elementCounts, pillarsOf, tenGodOf } from './saju';
import type { SajuResult } from './saju';
import type { LessonCard, LessonChip } from './lessons';

const PILLAR_LABEL = { year: '년주', month: '월주', day: '일주', hour: '시주' } as const;
const ELEMENT_ORDER = ['wood', 'fire', 'earth', 'metal', 'water'] as const;

// Personal cards are filled from the user's own chart.
export function resolveCard(card: LessonCard, saju: SajuResult): { body: string; chips?: LessonChip[] } {
  if (card.personal === 'dayGan') {
    const { GAN_IMAGE } = getContent();
    const g = saju.day.gan;
    const yin = '乙丁己辛癸'.includes(g) ? '음' : '양';
    return {
      body: `내 일주는 ${saju.day.hangul}(${saju.day.ganZhi})이고, 일간은 ${saju.dayGanHangul}(${g})이에요. ${ELEMENT_HANGUL[saju.dayGanElement]}(${ELEMENT_HANJA[saju.dayGanElement]}) 기운의 ${yin}이고, 자연에 비유하면 '${GAN_IMAGE[g]}' 같은 사람이에요.`,
      chips: [{ glyph: g, caption: GAN_IMAGE[g] }],
    };
  }
  if (card.personal === 'elements') {
    const counts = elementCounts(saju);
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return {
      body: `내 ${total}글자에서 오행이 각각 몇 개인지 세어봤어요. ${total === 6 ? '(태어난 시간을 몰라서 여섯 글자예요.) ' : ''}0개인 오행은 드러나지 않은 기운이에요.`,
      chips: ELEMENT_ORDER.map((el) => ({ glyph: ELEMENT_HANJA[el], caption: `${counts[el]}개` })),
    };
  }
  if (card.personal === 'tenGods') {
    const others = pillarsOf(saju).filter((p) => p.key !== 'day');
    return {
      body: `내 일간 ${saju.day.gan}을 기준으로 다른 기둥의 천간이 어떤 십신인지 봐요. (일주 천간은 '나' 자신이라 제외했어요.)`,
      chips: others.map((p) => ({ glyph: p.pillar.gan, caption: `${PILLAR_LABEL[p.key]}\n${tenGodOf(saju.day.gan, p.pillar.gan)}` })),
    };
  }
  return { body: card.body, chips: card.chips };
}
