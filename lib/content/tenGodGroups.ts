// NOTE: AI-drafted text, not reviewed by a 명리 expert (see tenGods.ts).

export type TenGodGroup = '비겁' | '식상' | '재성' | '관성' | '인성';

export const GROUP_ORDER: TenGodGroup[] = ['비겁', '식상', '재성', '관성', '인성'];

export const GROUP_INFO: Record<
  TenGodGroup,
  { meaning: string; headline: string; strong: string; lacking: string }
> = {
  비겁: {
    meaning: '나와 같은 기운 · 자립과 경쟁',
    headline: '자기 힘으로 길을 여는 독립형',
    strong: '비겁이 강해요. 자기 주관과 독립심이 뚜렷하고 승부욕이 있어요. 고집이나 경쟁심이 앞서지 않게 주변 의견도 살펴보면 좋아요.',
    lacking: '비겁이 드러나지 않아요. 남에게 맞추는 편일 수 있어서, 내 목소리를 내는 연습이 도움이 돼요.',
  },
  식상: {
    meaning: '내가 만들어내는 기운 · 재능과 표현',
    headline: '표현하고 만들어내는 창작형',
    strong: '식상이 강해요. 표현력과 아이디어가 풍부하고 하고 싶은 말을 잘하는 편이에요. 마무리보다 새로운 시도에 마음이 먼저 갈 수 있어요.',
    lacking: '식상이 드러나지 않아요. 속마음을 삼키기 쉬워서, 글이나 취미처럼 표현할 통로를 만들면 좋아요.',
  },
  재성: {
    meaning: '내가 다스리는 기운 · 현실과 결과',
    headline: '현실을 잘 챙기는 실속형',
    strong: '재성이 강해요. 현실 감각이 좋고 결과를 챙기는 힘이 있어요. 성과에 마음이 쏠려 여유를 놓치지 않게 쉬어가세요.',
    lacking: '재성이 드러나지 않아요. 돈이나 현실적인 계획은 의식적으로 챙기면 도움이 돼요.',
  },
  관성: {
    meaning: '나를 다스리는 기운 · 책임과 질서',
    headline: '책임감 있는 원칙형',
    strong: '관성이 강해요. 책임감이 크고 규칙 안에서 인정받는 편이에요. 스스로에게 너무 엄격해지지 않게 마음을 풀어주면 좋아요.',
    lacking: '관성이 드러나지 않아요. 얽매이는 것을 싫어하는 자유로운 편이라, 약속과 마감은 스스로 정해두면 좋아요.',
  },
  인성: {
    meaning: '나를 도와주는 기운 · 배움과 안정',
    headline: '배우고 깊이 생각하는 학습형',
    strong: '인성이 강해요. 배우는 것을 좋아하고 생각이 깊으며 주변의 도움을 받는 편이에요. 생각이 길어져 행동이 늦어지지 않게 해보세요.',
    lacking: '인성이 드러나지 않아요. 스스로 헤쳐 나가는 힘이 있는 대신, 쉬고 배우는 시간을 일부러 챙기면 좋아요.',
  },
};

export const GROUP_BALANCED = '다섯 갈래가 고르게 있는 편이라 한쪽으로 치우치지 않은 균형형이에요.';
