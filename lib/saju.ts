import { Solar, Lunar } from 'lunar-javascript';

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
};

const GAN_HANGUL: Record<string, string> = {
  甲: '갑', 乙: '을', 丙: '병', 丁: '정', 戊: '무',
  己: '기', 庚: '경', 辛: '신', 壬: '임', 癸: '계',
};

const ZHI_HANGUL: Record<string, string> = {
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

/**
 * lunar-javascript's solar-term/day-boundary math is computed for China
 * Standard Time (UTC+8). Korea runs on KST (UTC+9), exactly one hour ahead,
 * so shifting the input back by one hour before handing it to the library
 * reproduces the correct KST-based 절기/일진 cutoffs. This is the standard
 * trick for reusing CST-based Chinese calendar libraries for Korean saju.
 */
function toBeijingEquivalent(year: number, month: number, day: number, hour: number, minute: number) {
  const kst = new Date(year, month - 1, day, hour, minute, 0);
  const shifted = new Date(kst.getTime() - 60 * 60 * 1000);
  return {
    year: shifted.getFullYear(),
    month: shifted.getMonth() + 1,
    day: shifted.getDate(),
    hour: shifted.getHours(),
    minute: shifted.getMinutes(),
  };
}

export function calculateSaju(input: BirthInput): SajuResult {
  // When birth time is unknown, noon is used only to pick a stable point
  // inside the correct day for year/month/day pillar math — the hour
  // pillar itself is discarded below (`hour: null` on the result).
  const hour = input.hour ?? 12;
  const minute = input.minute ?? 0;

  // Lunar-calendar input is converted to its solar date first, then follows the
  // same KST-shifted path as solar input so the hour pillar stays correct.
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

  const b = toBeijingEquivalent(y, m, d, hour, minute);
  const lunar = Solar.fromYmdHms(b.year, b.month, b.day, b.hour, b.minute, 0).getLunar();

  const ec = lunar.getEightChar();

  const year = buildPillar(ec.getYearGan(), ec.getYearZhi());
  const month = buildPillar(ec.getMonthGan(), ec.getMonthZhi());
  const day = buildPillar(ec.getDayGan(), ec.getDayZhi());
  const hourPillar = input.hour === null ? null : buildPillar(ec.getTimeGan(), ec.getTimeZhi());

  const genderCode = input.gender === 'male' ? 1 : 0;
  const daYunList = ec.getYun(genderCode).getDaYun();
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
  };
}
