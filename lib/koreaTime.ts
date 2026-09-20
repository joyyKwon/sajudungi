// Korea's legal clock has changed over time. Given a *wall-clock* reading (what
// a birth certificate says), this returns the UTC offset that was in force so
// the reading can be turned into a real instant. Rules follow the IANA tz
// database for Asia/Seoul (verified against Node's Intl in the test sweep).

const MIN = 60_000;

const at = (y: number, m: number, d: number, h = 0, mi = 0) => Date.UTC(y, m - 1, d, h, mi);

/** First `weekday` (0=Sun) on or after y-m-d. */
function onOrAfter(y: number, m: number, d: number, weekday: number) {
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return d + ((weekday - dow + 7) % 7);
}

// Standard-time periods as [wall-clock start, offset minutes]. Later entries win.
const STANDARD: [number, number][] = [
  [Date.UTC(1800, 0, 1), 507.87], // Seoul local mean time (+8:27:52) before 1908
  [at(1908, 4, 1), 510], // UTC+8:30 (동경 127.5°)
  [at(1912, 1, 1), 540], // UTC+9 (동경 135°)
  [at(1954, 3, 21), 510], // back to UTC+8:30
  [at(1961, 8, 10), 540], // UTC+9 again
];

type Range = [number, number]; // [start, end) in DST wall-clock

function dstRanges(): Range[] {
  const r: Range[] = [
    [at(1948, 6, 1), at(1948, 9, 13)],
    [at(1949, 4, 3), at(1949, 9, onOrAfter(1949, 9, 7, 6) + 1)],
    [at(1950, 4, 1), at(1950, 9, onOrAfter(1950, 9, 7, 6) + 1)],
    [at(1951, 5, 6), at(1951, 9, onOrAfter(1951, 9, 7, 6) + 1)],
    [at(1955, 5, 5), at(1955, 9, 9)],
    [at(1956, 5, 20), at(1956, 9, 30)],
  ];
  for (let y = 1957; y <= 1960; y++) {
    r.push([at(y, 5, onOrAfter(y, 5, 1, 0)), at(y, 9, onOrAfter(y, 9, 17, 6) + 1)]);
  }
  for (const y of [1987, 1988]) {
    r.push([at(y, 5, onOrAfter(y, 5, 8, 0), 2), at(y, 10, onOrAfter(y, 10, 8, 0), 3)]);
  }
  return r;
}

const DST = dstRanges();

export type KoreaOffset = {
  /** Minutes east of UTC at this wall-clock reading. */
  offset: number;
  /** True while daylight-saving time was in force (already included in `offset`). */
  dst: boolean;
  /** True while the legal standard meridian was 동경 127.5° (UTC+8:30). */
  meridian127: boolean;
};

export function koreaOffsetAt(wallMs: number): KoreaOffset {
  let base = STANDARD[0][1];
  for (const [start, offset] of STANDARD) {
    if (wallMs >= start) base = offset;
  }
  const dst = DST.some(([s, e]) => wallMs >= s && wallMs < e);
  return { offset: base + (dst ? 60 : 0), dst, meridian127: base === 510 };
}

/** Wall-clock reading (as naive UTC ms) → the real UTC instant in ms. */
export function wallToUtcMs(wallMs: number) {
  const { offset } = koreaOffsetAt(wallMs);
  return wallMs - offset * MIN;
}
