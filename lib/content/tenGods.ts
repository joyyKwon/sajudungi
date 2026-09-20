import type { TenGod } from '../saju';

// NOTE: Text in lib/content was drafted by an AI (Claude) and has NOT been
// reviewed by a 명리 expert. Have it reviewed before release, and keep the
// "재미로 참고" disclaimer visible next to interpretations.

export type TenGodInfo = {
  hanja: string;
  group: '비겁' | '식상' | '재성' | '관성' | '인성';
  /** One-line meaning relative to the day master ("나"). */
  meaning: string;
  /** 사주둥이's line for the 오늘의 한마디 card when today's stem is this 십신. */
  today: string;
};

export const TEN_GODS: Record<TenGod, TenGodInfo> = {
  비견: {
    hanja: '比肩',
    group: '비겁',
    meaning: '나와 같은 기운 · 동료와 자립심',
    today: '오늘은 나와 결이 비슷한 사람이 곁에 있어. 함께하면 든든하지만 괜한 경쟁심은 조심해!',
  },
  겁재: {
    hanja: '劫財',
    group: '비겁',
    meaning: '나와 같은 기운 · 경쟁과 추진력',
    today: '오늘은 승부욕이 살아나는 날이야. 욕심내서 무리하기보다 나눠 쓰는 마음이 좋아!',
  },
  식신: {
    hanja: '食神',
    group: '식상',
    meaning: '내가 만들어내는 기운 · 재능과 여유',
    today: '오늘은 마음이 여유롭고 표현이 술술 나오는 날이야. 하고 싶던 걸 해봐!',
  },
  상관: {
    hanja: '傷官',
    group: '식상',
    meaning: '내가 만들어내는 기운 · 자유로운 표현',
    today: '오늘은 톡톡 튀는 아이디어가 잘 떠올라. 말은 조금만 부드럽게 하면 더 좋아!',
  },
  편재: {
    hanja: '偏財',
    group: '재성',
    meaning: '내가 다스리는 기운 · 유동적인 재물과 기회',
    today: '오늘은 새로운 기회나 만남이 스치는 날이야. 지출은 한 번 더 확인하자!',
  },
  정재: {
    hanja: '正財',
    group: '재성',
    meaning: '내가 다스리는 기운 · 꾸준함과 성실',
    today: '오늘은 차근차근 정리하고 챙기기 좋은 날이야. 작은 성실함이 쌓일 거야!',
  },
  편관: {
    hanja: '偏官',
    group: '관성',
    meaning: '나를 다스리는 기운 · 도전과 책임',
    today: '오늘은 조금 긴장되는 일이 있을 수 있어. 숨 고르고 하나씩 해결하면 돼!',
  },
  정관: {
    hanja: '正官',
    group: '관성',
    meaning: '나를 다스리는 기운 · 질서와 신뢰',
    today: '오늘은 약속과 규칙을 지키면 신뢰가 쌓이는 날이야. 정돈된 하루를 보내봐!',
  },
  편인: {
    hanja: '偏印',
    group: '인성',
    meaning: '나를 도와주는 기운 · 직관과 독특한 배움',
    today: '오늘은 혼자 생각하고 배우기 좋은 날이야. 독특한 영감이 떠오를 수 있어!',
  },
  정인: {
    hanja: '正印',
    group: '인성',
    meaning: '나를 도와주는 기운 · 학문과 보호',
    today: '오늘은 주변의 도움과 응원이 따르는 날이야. 배우고 쉬며 마음을 채워봐!',
  },
};
