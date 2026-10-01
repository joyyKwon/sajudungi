// 조합 풀이 (월지·재성·일지) and 신살: content completeness, rule checks on hand-worked
// charts, and invariants over random charts.
import { LunarUtil } from 'lunar-javascript';
import { calculateSaju, pillarsOf, tenGodOf, ZHI_MAIN_GAN, SajuResult } from '../lib/saju';
import { TEN_GODS } from '../lib/content/tenGods';
import { LOVE_BY_DAY_GOD, PERSONALITY_BY_MONTH_GOD, WEALTH_BY_JAESEONG } from '../lib/content/detail';
import { SINSAL, SINSAL_NONE, SINSAL_POSITION, SINSAL_REPEATED } from '../lib/content/sinsal';
import { loveDetail, personalityDetail, wealthDetail } from '../lib/detail';
import { gongmangOf, sinsalOf } from '../lib/sinsal';
import { tenGodGroupCounts } from '../lib/tenGodGroups';

let pass = 0, fail = 0;
const ok = (label: string, cond: boolean, extra?: unknown) => (cond ? pass++ : (fail++, console.log('FAIL', label, extra ?? '')));

const BANNED = ['죽', '사망', '이혼', '재앙', '불행', '질병', '파산', '망한', '저주', '큰일', '반드시', '절대'];
const clean = (s: string) => !/undefined|NaN|null|\[object/.test(s) && !BANNED.some((w) => s.includes(w));
const sentences = (s: string) => s.split(/(?<=[.요])\s+/).filter(Boolean).length;

// Content
const GODS = Object.keys(TEN_GODS);
for (const [name, table] of [['PERSONALITY', PERSONALITY_BY_MONTH_GOD], ['LOVE', LOVE_BY_DAY_GOD]] as const) {
  for (const g of GODS) {
    const t = (table as Record<string, string>)[g];
    ok(`${name} ${g}: 4+ sentences`, !!t && sentences(t) >= 4 && t.length >= 150 && clean(t), t);
  }
  ok(`${name} unique`, new Set(Object.values(table)).size === 10);
}
for (const t of Object.values(WEALTH_BY_JAESEONG)) ok('WEALTH text: 4+ sentences', sentences(t) >= 4 && t.length >= 150 && clean(t), t);
ok('10 신살', Object.keys(SINSAL).length === 10);
for (const [k, s] of Object.entries(SINSAL)) ok(`SINSAL ${k}`, s.name.length >= 2 && s.hanja.length >= 2 && s.title.length >= 4 && s.body.length >= 60 && clean(s.name + s.title + s.body), s);
ok('SINSAL bodies unique', new Set(Object.values(SINSAL).map((s) => s.body)).size === 10);
ok('position text', Object.values(SINSAL_POSITION).every((t) => t.length >= 4 && clean(t)) && clean(SINSAL_REPEATED + SINSAL_NONE));

// Hand-worked charts (see the rule tables in lib/sinsal.ts)
const chart = (gender: 'male' | 'female', y: number, m: number, d: number, h: number | null) =>
  calculateSaju({ gender, year: y, month: m, day: d, hour: h, minute: h === null ? null : 0, calendarType: 'solar' });
const summary = (s: SajuResult) => sinsalOf(s).map((x) => `${x.key}:${x.positions.join('+')}`).join(' ');

const A = chart('female', 1995, 6, 15, 12); // 乙亥 壬午 丁丑 丙午
ok('A pillars', [A.year, A.month, A.day, A.hour!].map((p) => p.ganZhi).join(' ') === '乙亥 壬午 丁丑 丙午');
ok('A 신살', summary(A) === 'cheoneul:year dohwa:month+hour yeokma:year baekho:day', summary(A));
const B = chart('female', 1992, 11, 17, 9); // 壬申 辛亥 丁酉 甲辰
ok('B pillars', [B.year, B.month, B.day, B.hour!].map((p) => p.ganZhi).join(' ') === '壬申 辛亥 丁酉 甲辰');
ok('B 신살', summary(B) === 'cheoneul:month+day munchang:day dohwa:day yeokma:month hwagae:hour baekho:hour gongmang:hour', summary(B));
const C = chart('male', 1988, 3, 10, 15); // 戊辰 乙卯 甲子 辛未
ok('C pillars', [C.year, C.month, C.day, C.hour!].map((p) => p.ganZhi).join(' ') === '戊辰 乙卯 甲子 辛未');
ok('C 신살', summary(C) === 'cheoneul:hour hwagae:year yangin:month baekho:year', summary(C));
// Without the hour, B loses everything that only sat in the hour pillar.
const B0 = chart('female', 1992, 11, 17, null);
ok('B without hour', summary(B0) === 'cheoneul:month+day munchang:day dohwa:day yeokma:month', summary(B0));

// 조합 풀이 on the same charts: same 일간 (丁), different paragraphs.
ok('A/B personality differ', personalityDetail(A).text !== personalityDetail(B).text);
ok('A personality = 월지 午 비견', personalityDetail(A).text === PERSONALITY_BY_MONTH_GOD.비견 && personalityDetail(A).basis.includes('비견'));
ok('B personality = 월지 亥 정관', personalityDetail(B).text === PERSONALITY_BY_MONTH_GOD.정관);
ok('A wealth none', wealthDetail(A).text === WEALTH_BY_JAESEONG.none && wealthDetail(A).basis.startsWith('재성(재물·현실 감각의 기운) 0개'));
ok('B wealth many', wealthDetail(B).text === WEALTH_BY_JAESEONG.many && wealthDetail(B).basis.startsWith('재성(재물·현실 감각의 기운) 3개'));
ok('A love 식신', loveDetail(A).text === LOVE_BY_DAY_GOD.식신 && loveDetail(A).basis === '배우자 자리(일지) 丑(축) · 식신', loveDetail(A).basis);
ok('B love 편재', loveDetail(B).text === LOVE_BY_DAY_GOD.편재);
ok('C love 정인', loveDetail(C).text === LOVE_BY_DAY_GOD.정인);
// Classical references: 월지/일지 seat plus the 십신 chapter; none when there is no 재성 to speak of.
ok('A personality reference', personalityDetail(A).reference === '《연해자평》 論月令 "月為提綱" · 論兄弟姊妹 "比肩者，兄弟也"', personalityDetail(A).reference);
ok('B personality reference names 正官論', personalityDetail(B).reference!.includes('正官論'));
ok('love reference is the day-branch passage', loveDetail(A).reference === '《연해자평》 "日干為己身，日支為妻妾"');
ok('A wealth (재성 0) has no reference', wealthDetail(A).reference === null);
ok('B wealth reference', wealthDetail(B).reference === '《연해자평》 論正財 "財要得時，不要財多"');

// 공망 agrees with lunar-javascript for all 60 pillars
const GAN = '甲乙丙丁戊己庚辛壬癸';
const ZHI = '子丑寅卯辰巳午未申酉戌亥';
for (let i = 0; i < 60; i++) {
  const gz = GAN[i % 10] + ZHI[i % 12];
  ok(`공망 ${gz}`, gongmangOf(gz).join('') === LunarUtil.getXunKong(gz), [gongmangOf(gz), LunarUtil.getXunKong(gz)]);
}

// Random charts
let seed = 23; const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
const seen = new Set<string>();
for (let i = 0; i < 3000; i++) {
  const withHour = rnd() > 0.25;
  const s = chart(rnd() > 0.5 ? 'male' : 'female', 1930 + Math.floor(rnd() * 90), 1 + Math.floor(rnd() * 12), 1 + Math.floor(rnd() * 28), withHour ? Math.floor(rnd() * 24) : null);
  const keys = pillarsOf(s).map((p) => p.key);
  const hits = sinsalOf(s);
  for (const h of hits) {
    seen.add(h.key);
    ok('positions exist in chart', h.positions.length > 0 && h.positions.every((p) => keys.includes(p)), h);
    ok('positions unique and ordered', h.positions.join() === keys.filter((k) => h.positions.includes(k)).join(), h);
    ok('공망 never on the day branch', h.key !== 'gongmang' || !h.positions.includes('day'), h);
    ok('hit text clean', clean(h.basis + h.info.body), h.basis);
  }
  ok('no hour → no hour hits', withHour || hits.every((h) => !h.positions.includes('hour')));

  const p = personalityDetail(s), w = wealthDetail(s), l = loveDetail(s);
  ok('personality follows 월지', p.text === (PERSONALITY_BY_MONTH_GOD as Record<string, string>)[tenGodOf(s.dayGan, ZHI_MAIN_GAN[s.month.zhi])]);
  ok('love follows 일지', l.text === (LOVE_BY_DAY_GOD as Record<string, string>)[tenGodOf(s.dayGan, ZHI_MAIN_GAN[s.day.zhi])]);
  const n = tenGodGroupCounts(s).재성;
  ok('wealth follows 재성 count', w.text === (n === 0 ? WEALTH_BY_JAESEONG.none : n <= 2 ? WEALTH_BY_JAESEONG.some : WEALTH_BY_JAESEONG.many));
  ok('detail text clean', clean(p.text + p.basis + w.text + w.basis + l.text + l.basis));
}
ok('every 신살 shows up somewhere in 3000 charts', seen.size === 10, [...seen]);

console.log(`verify-detail: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
