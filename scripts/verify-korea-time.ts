import { koreaOffsetAt } from '../lib/koreaTime';
const fmt = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Seoul', hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });
const offsetOf = (t: number) => {
  const p: Record<string, number> = {};
  for (const part of fmt.formatToParts(new Date(t))) if (part.type !== 'literal') p[part.type] = Number(part.value);
  const wall = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return { wall, offset: (wall - t) / 60000 };
};
// Compares koreaOffsetAt (looked up by local wall time) with the tz database over every half hour, 1908-2030.
// Wall-clock lookups are ambiguous in the hour a clock is set back (the same wall time happens twice), so a
// difference is only allowed there; anywhere else it is a real bug.
const wallOf = (t: number) => offsetOf(t).wall;
let checked = 0, fold = 0; const bad: string[] = [];
for (let t = Date.UTC(1908, 3, 2); t < Date.UTC(2031, 0, 1); t += 30 * 60000) {
  const { wall, offset } = offsetOf(t);
  const mine = koreaOffsetAt(wall).offset;
  checked++;
  if (Math.abs(mine - offset) <= 0.01) continue;
  const repeated = [-90, -60, -30, 30, 60, 90].some((d) => wallOf(t + d * 60000) === wall);
  if (repeated) fold++;
  else bad.push(`${new Date(wall).toISOString()} intl=${offset} mine=${mine}`);
}
console.log(`verify-korea-time: ${checked} instants checked, ${fold} differ only in a repeated (clock set back) hour, ${bad.length} real mismatches`);
if (bad.length) console.log(bad.slice(0, 12).join('\n'));
process.exit(bad.length ? 1 : 0);
