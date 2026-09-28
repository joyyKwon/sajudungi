// lunar-javascript ships no type declarations. This is a minimal ambient
// typing covering only the surface lib/saju.ts actually calls — not a full
// port of the library's API.
declare module 'lunar-javascript' {
  export class Solar {
    static fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): Solar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getHour(): number;
    getMinute(): number;
    getSecond(): number;
    getLunar(): Lunar;
  }

  export class Lunar {
    static fromYmd(year: number, month: number, day: number): Lunar;
    getSolar(): Solar;
    getEightChar(): EightChar;
    /** Solar-term instants (China Standard Time) around this lunar year, keyed by Chinese name or, outside the year, pinyin (e.g. XIAO_HAN, LI_CHUN). */
    getJieQiTable(): Record<string, Solar>;
  }

  export class GanZhi {
    getGanZhi(): string;
    getStartYear(): number;
    getEndYear(): number;
    getStartAge(): number;
    getEndAge(): number;
  }

  export class Yun {
    getDaYun(): GanZhi[];
  }

  export const LunarUtil: {
    /** 순중공망 of a 간지, e.g. '甲子' → '戌亥'. */
    getXunKong(ganZhi: string): string;
  };

  export class EightChar {
    getYear(): string;
    getYearGan(): string;
    getYearZhi(): string;
    getMonth(): string;
    getMonthGan(): string;
    getMonthZhi(): string;
    getDay(): string;
    getDayGan(): string;
    getDayZhi(): string;
    getTime(): string;
    getTimeGan(): string;
    getTimeZhi(): string;
    getYun(gender: 0 | 1): Yun;
    setSect(sect: 1 | 2): void;
    getYearShiShenGan(): string;
    getMonthShiShenGan(): string;
    getTimeShiShenGan(): string;
  }
}
