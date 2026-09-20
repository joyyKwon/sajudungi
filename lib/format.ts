export function formatTime(hour: number, minute: number) {
  const period = hour < 12 ? '오전' : '오후';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return minute === 0 ? `${period} ${h12}시` : `${period} ${h12}시 ${minute}분`;
}

import type { CalcBasis } from './saju';

export function describeBasis(basis: CalcBasis) {
  const parts = [
    basis.longitudeCorrection ? '진태양시 보정 −30분' : '표준시 그대로',
    basis.jasi === 'yajasi' ? '야자시' : '조자시',
    ...basis.notes.filter((n) => !n.startsWith('진태양시')),
  ];
  return parts.join(' · ');
}

type BirthDateLike = { year: number; month: number; day: number; calendarType: 'solar' | 'lunar'; isLeapMonth?: boolean };

/** "1996년 3월 14일" or "음력 1995년 윤8월 1일". */
export function formatBirthDate(b: BirthDateLike) {
  const lunar = b.calendarType === 'lunar';
  return `${lunar ? '음력 ' : ''}${b.year}년 ${lunar && b.isLeapMonth ? '윤' : ''}${b.month}월 ${b.day}일`;
}
