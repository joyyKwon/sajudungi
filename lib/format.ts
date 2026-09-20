export function formatTime(hour: number, minute: number) {
  const period = hour < 12 ? '오전' : '오후';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return minute === 0 ? `${period} ${h12}시` : `${period} ${h12}시 ${minute}분`;
}
