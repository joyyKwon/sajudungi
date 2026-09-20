import type { WuXing } from './saju';

export const ELEMENT_KO: Record<WuXing, string> = {
  wood: '목(木)',
  fire: '화(火)',
  earth: '토(土)',
  metal: '금(金)',
  water: '수(水)',
};

export const ELEMENT_HANGUL: Record<WuXing, string> = {
  wood: '목',
  fire: '화',
  earth: '토',
  metal: '금',
  water: '수',
};

export const ELEMENT_HANJA: Record<WuXing, string> = {
  wood: '木',
  fire: '火',
  earth: '土',
  metal: '金',
  water: '水',
};

// MOCK: 간지별 해석 콘텐츠(60갑자 매핑, 십신 기반 해석 등)가 아직 없어서 천간 오행별 일반 문구로
// 대체 중. 사주풀이/만세력 화면의 해석 텍스트는 전부 여기서 나오므로, 실제 콘텐츠가 생기면 이 파일을 교체.
export const ELEMENT_TRAIT: Record<WuXing, string> = {
  wood: '곧게 뻗어 자라나려는 성장의 기운이라, 새로운 일을 시작하는 데 두려움이 적은 편이에요.',
  fire: '밝고 뜨거운 열정의 기운이라, 주변을 환하게 만드는 매력이 있어요.',
  earth: '든든하고 안정적인 기운이라, 믿음직하다는 말을 자주 들어요.',
  metal: '단단하고 결단력 있는 기운이라, 마음먹은 건 깔끔하게 실행에 옮겨요.',
  water: '깊고 유연한 지혜의 기운이라, 상황을 차분히 읽고 적응하는 힘이 있어요.',
};
