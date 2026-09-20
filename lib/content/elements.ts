import type { WuXing } from '../saju';

// NOTE: AI-drafted text, not reviewed by a 명리 expert (see tenGods.ts).

/** Comment when an element does not appear among the visible characters. */
export const ELEMENT_LACKING: Record<WuXing, string> = {
  wood: '목(木) 기운이 드러나지 않아요. 성장과 시작의 에너지를 의식적으로 채우면 좋아요. 새로운 배움이나 산책 같은 활동이 잘 맞을 수 있어요.',
  fire: '화(火) 기운이 드러나지 않아요. 열정과 표현을 꺼내는 연습이 도움이 돼요. 좋아하는 일을 소리 내어 이야기해보세요.',
  earth: '토(土) 기운이 드러나지 않아요. 안정감과 꾸준함을 만드는 나만의 루틴이 도움이 돼요.',
  metal: '금(金) 기운이 드러나지 않아요. 결단하고 마무리하는 힘을 의식해서 챙기면 좋아요.',
  water: '수(水) 기운이 드러나지 않아요. 여유를 갖고 생각을 정리하는 시간이 도움이 돼요.',
};

/** Comment when an element appears three or more times. */
export const ELEMENT_STRONG: Record<WuXing, string> = {
  wood: '목(木) 기운이 강해요. 성장욕과 추진력이 큰 대신 고집이 세질 수 있어요.',
  fire: '화(火) 기운이 강해요. 열정과 표현력이 큰 대신 성급해지기 쉬워요.',
  earth: '토(土) 기운이 강해요. 신중하고 안정적인 대신 변화에는 느릴 수 있어요.',
  metal: '금(金) 기운이 강해요. 원칙과 결단력이 큰 대신 딱딱해 보일 수 있어요.',
  water: '수(水) 기운이 강해요. 지혜롭고 유연한 대신 생각이 많아지기 쉬워요.',
};

export const ELEMENT_BALANCED = '다섯 기운이 비교적 고르게 퍼져 있어요. 한쪽으로 크게 치우치지 않은 편이에요.';
