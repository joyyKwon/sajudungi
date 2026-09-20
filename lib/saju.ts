import { Solar, Lunar } from 'lunar-javascript';
import { koreaOffsetAt } from './koreaTime';

export type Gender = 'male' | 'female';
export type CalendarType = 'solar' | 'lunar';
export type WuXing = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

export type BirthInput = {
  gender: Gender;
  year: number;
  month: number;
  day: number;
  /** null when the user doesn't know their birth time — hour pillar is omitted. */
  hour: number | null;
  minute: number | null;
  calendarType: CalendarType;
};

export type Pillar = {
  gan: string; // 천간 한자, e.g. "甲"
  zhi: string; // 지지 한자, e.g. "子"
  ganZhi: string; // "甲子"
  hangul: string; // "갑자"
  ganElement: WuXing;
  zhiElement: WuXing;
};

export type DaeunEntry = {
  startAge: number;
  endAge: number;
  startYear: number;
  endYear: number;
  ganZhi: string;
  hangul: string;
};

export type SeunEntry = {
  year: number;
  ganZhi: string;
  hangul: string;
};

export type SajuOptions = {
  /** 진태양시 보정: 동경 127.5° 기준으로 −30분. 시주·일주 경계에 영향. */
  longitudeCorrection: boolean;
  /** yajasi: 23시대는 일주 당일 유지(시주만 子). jojasi: 23시부터 일주도 다음날. */
  jasi: 'yajasi' | 'jojasi';
};

export const DEFAULT_SAJU_OPTIONS: SajuOptions = { longitudeCorrection: true, jasi: 'yajasi' };

export type CalcBasis = SajuOptions & {
  /** Human-readable adjustments actually applied to this birth time. */
  notes: string[];
};

export type SajuResult = {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  /** null when birth time is unknown. */
  hour: Pillar | null;
  dayGan: string;
  dayGanHangul: string;
  dayGanElement: WuXing;
  daeun: DaeunEntry[];
  seun: SeunEntry[];
  basis: CalcBasis;
};

export const GAN_HANGUL: Record<string, string> = {
  甲: '갑', 乙: '을', 丙: '병', 丁: '정', 戊: '무',
  己: '기', 庚: '경', 辛: '신', 壬: '임', 癸: '계',
};

export const ZHI_HANGUL: Record<string, string> = {
  子: '자', 丑: '축', 寅: '인', 卯: '묘', 辰: '진', 巳: '사',
  午: '오', 未: '미', 申: '신', 酉: '유', 戌: '술', 亥: '해',
};

const GAN_ELEMENT: Record<string, WuXing> = {
  甲: 'wood', 乙: 'wood',
  丙: 'fire', 丁: 'fire',
  戊: 'earth', 己: 'earth',
  庚: 'metal', 辛: 'metal',
  壬: 'water', 癸: 'water',
};

const ZHI_ELEMENT: Record<string, WuXing> = {
  寅: 'wood', 卯: 'wood',
  巳: 'fire', 午: 'fire',
  辰: 'earth', 戌: 'earth', 丑: 'earth', 未: 'earth',
  申: 'metal', 酉: 'metal',
  亥: 'water', 子: 'water',
};

function buildPillar(gan: string, zhi: string): Pillar {
  return {
    gan,
    zhi,
    ganZhi: `${gan}${zhi}`,
    hangul: `${GAN_HANGUL[gan]}${ZHI_HANGUL[zhi]}`,
    ganElement: GAN_ELEMENT[gan],
    zhiElement: ZHI_ELEMENT[zhi],
  };
}

const MIN = 60_000;
const BEIJING_OFFSET = 480; // lunar-javascript's solar-term tables are in China Standard Time

function solarAt(utcMs: number, offsetMinutes: number) {
  const d = new Date(utcMs + offsetMinutes * MIN);
  return Solar.fromYmdHms(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), 0);
}

/**
 * Two different clocks are needed:
 *  - 년주/월주 flip at an astronomical instant (절입). We convert the birth
 *    wall-clock to the real UTC instant (honouring Korea's historical
 *    standard-time/DST changes) and read it in Beijing time, which is what
 *    lunar-javascript's solar-term tables use.
 *  - 일주/시주 follow the local clock. That clock is Korean standard time, or
 *    with 진태양시 보정 the mean solar time at 동경 127.5° (UTC+8:30).
 */
export function calculateSaju(input: BirthInput, options: SajuOptions = DEFAULT_SAJU_OPTIONS): SajuResult {
  // When birth time is unknown, noon is used only to pick a stable point
  // inside the correct day — the hour pillar itself is discarded below.
  const hour = input.hour ?? 12;
  const minute = input.minute ?? 0;

  // Lunar-calendar input is converted to its solar date first.
  // (Leap-month input isn't supported yet — the picker has no 윤달 toggle.)
  let y = input.year;
  let m = input.month;
  let d = input.day;
  if (input.calendarType === 'lunar') {
    const converted = Lunar.fromYmd(y, m, d).getSolar();
    y = converted.getYear();
    m = converted.getMonth();
    d = converted.getDay();
  }

  const wallMs = Date.UTC(y, m - 1, d, hour, minute);
  const korea = koreaOffsetAt(wallMs);
  const utcMs = wallMs - korea.offset * MIN;

  const clockOffset = options.longitudeCorrection ? 510 : 540;
  const ecYm = solarAt(utcMs, BEIJING_OFFSET).getLunar().getEightChar();
  const ecDh = solarAt(utcMs, clockOffset).getLunar().getEightChar();
  ecDh.setSect(options.jasi === 'yajasi' ? 2 : 1);

  const notes: string[] = [];
  if (korea.dst) notes.push('서머타임 −60분 반영');
  if (korea.meridian127) notes.push('동경 127.5° 표준시 시기 반영');
  if (options.longitudeCorrection && !korea.meridian127) notes.push('진태양시 −30분 보정');

  const year = buildPillar(ecYm.getYearGan(), ecYm.getYearZhi());
  const month = buildPillar(ecYm.getMonthGan(), ecYm.getMonthZhi());
  const day = buildPillar(ecDh.getDayGan(), ecDh.getDayZhi());
  const hourPillar = input.hour === null ? null : buildPillar(ecDh.getTimeGan(), ecDh.getTimeZhi());

  const genderCode = input.gender === 'male' ? 1 : 0;
  const daYunList = ecYm.getYun(genderCode).getDaYun();
  const daeun: DaeunEntry[] = daYunList
    .filter((dy) => dy.getGanZhi())
    .map((dy) => ({
      startAge: dy.getStartAge(),
      endAge: dy.getEndAge(),
      startYear: dy.getStartYear(),
      endYear: dy.getEndYear(),
      ganZhi: dy.getGanZhi(),
      hangul: `${GAN_HANGUL[dy.getGanZhi()[0]]}${ZHI_HANGUL[dy.getGanZhi()[1]]}`,
    }));

  const currentYear = new Date().getFullYear();
  const seun: SeunEntry[] = [];
  for (let y = currentYear - 1; y <= currentYear + 2; y++) {
    // June 1st is always safely inside the 입춘-based year boundary either way.
    const yearGanZhi = Solar.fromYmdHms(y, 6, 1, 12, 0, 0).getLunar().getEightChar().getYear();
    seun.push({
      year: y,
      ganZhi: yearGanZhi,
      hangul: `${GAN_HANGUL[yearGanZhi[0]]}${ZHI_HANGUL[yearGanZhi[1]]}`,
    });
  }

  return {
    year,
    month,
    day,
    hour: hourPillar,
    dayGan: day.gan,
    dayGanHangul: GAN_HANGUL[day.gan],
    dayGanElement: day.ganElement,
    daeun,
    seun,
    basis: { ...options, notes },
  };
}

// ---- 십신 / 오행 분포 helpers ---------------------------------------------

export type TenGod = '비견' | '겁재' | '식신' | '상관' | '편재' | '정재' | '편관' | '정관' | '편인' | '정인';

const ELEMENT_CYCLE: WuXing[] = ['wood', 'fire', 'earth', 'metal', 'water'];
const YANG_GAN = new Set(['甲', '丙', '戊', '庚', '壬']);

/** 십신: how `gan` relates to the day master `dayGan` (element cycle + polarity). */
export function tenGodOf(dayGan: string, gan: string): TenGod {
  const step = (ELEMENT_CYCLE.indexOf(GAN_ELEMENT[gan]) - ELEMENT_CYCLE.indexOf(GAN_ELEMENT[dayGan]) + 5) % 5;
  const samePolarity = YANG_GAN.has(dayGan) === YANG_GAN.has(gan);
  switch (step) {
    case 0: return samePolarity ? '비견' : '겁재';
    case 1: return samePolarity ? '식신' : '상관';
    case 2: return samePolarity ? '편재' : '정재';
    case 3: return samePolarity ? '편관' : '정관';
    default: return samePolarity ? '편인' : '정인';
  }
}

/** 지지의 본기(주된 지장간). */
export const ZHI_MAIN_GAN: Record<string, string> = {
  子: '癸', 丑: '己', 寅: '甲', 卯: '乙', 辰: '戊', 巳: '丙',
  午: '丁', 未: '己', 申: '庚', 酉: '辛', 戌: '戊', 亥: '壬',
};

export type PillarKey = 'year' | 'month' | 'day' | 'hour';

export function pillarsOf(saju: SajuResult): { key: PillarKey; pillar: Pillar }[] {
  const list: { key: PillarKey; pillar: Pillar }[] = [
    { key: 'year', pillar: saju.year },
    { key: 'month', pillar: saju.month },
    { key: 'day', pillar: saju.day },
  ];
  if (saju.hour) list.push({ key: 'hour', pillar: saju.hour });
  return list;
}

/** Count of each 오행 across the visible characters (천간+지지 of each pillar; hidden stems excluded). */
export function elementCounts(saju: SajuResult): Record<WuXing, number> {
  const counts: Record<WuXing, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  for (const { pillar } of pillarsOf(saju)) {
    counts[pillar.ganElement] += 1;
    counts[pillar.zhiElement] += 1;
  }
  return counts;
}
