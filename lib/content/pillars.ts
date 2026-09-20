import type { PillarKey } from '../saju';

// NOTE: AI-drafted text, not reviewed by a 명리 expert (see tenGods.ts).

export const PILLAR_INFO: Record<PillarKey, { label: string; meaning: string }> = {
  year: { label: '년주', meaning: '조상과 어린 시절, 바깥 환경' },
  month: { label: '월주', meaning: '부모와 사회, 직업 환경' },
  day: { label: '일주', meaning: '나 자신(일간)과 배우자 자리(일지)' },
  hour: { label: '시주', meaning: '자녀와 후반기, 결과' },
};
