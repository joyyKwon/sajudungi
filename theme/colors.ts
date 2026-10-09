// 디자인 토큰. 시안을 바꿀 때(예: 옵션1 인디고 톤) 이 파일만 교체하면 전체 앱 색상이 바뀐다.
export const colors = {
  bg: '#FBF3E7',
  bgCard: '#FFFDF9',
  ink: '#3B2A1D',
  inkSoft: '#8A7A68',
  inkFaint: '#B7A78F',
  amberSoft: '#F7E3B8',
  amberDeep: '#F0B94A',
  red: '#B23A22',
  redSoft: '#F6D9CE',
  line: '#E9DCC8',
  white: '#FFFFFF',
  wood: '#4F9A6B',
  fire: '#C0432A',
  earth: '#B98A3F',
  // 금 is the 오방색 white: its glyphs sit in white boxes with this gray as text and outline (see theme/elements.ts).
  metal: '#8C8C8C',
  metalLine: '#CFCFCF',
  water: '#3A6EA8',
} as const;

export type ColorToken = keyof typeof colors;
