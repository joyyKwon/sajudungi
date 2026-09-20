import { koreaOffsetAt } from '../lib/koreaTime';
const fmt = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Seoul', hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });
const offsetOf = (t: number) => {
  const p: Record<string, number> = {};
  for (const part of fmt.formatToParts(new Date(t))) if (part.type !== 'literal') p[part.type] = Number(part.value);
  const wall = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return { wall, offset: (wall - t) / 60000 };
};
let checked = 0, mismatch = 0; const samples: string[] = [];
for (let t = Date.UTC(1908, 3, 2); t < Date.UTC(2031, 0, 1); t += 30 * 60000) {
  const { wall, offset } = offsetOf(t);
  const mine = koreaOffsetAt(wall).offset;
  checked++;
  if (Math.abs(mine - offset) > 0.01) { mismatch++; if (samples.length < 12) samples.push(`${new Date(wall).toISOString()} intl=${offset} mine=${mine}`); }
}
console.log({ checked, mismatch }); console.log(samples.join('\n'));
