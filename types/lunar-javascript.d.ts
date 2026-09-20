// lunar-javascript ships no type declarations. This is a minimal ambient
// typing covering only the surface lib/saju.ts actually calls — not a full
// port of the library's API.
declare module 'lunar-javascript' {
  export class Solar {
    static fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): Solar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getLunar(): Lunar;
  }

  export class Lunar {
    static fromYmd(year: number, month: number, day: number): Lunar;
    getSolar(): Solar;
    getEightChar(): EightChar;
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
  }
}
