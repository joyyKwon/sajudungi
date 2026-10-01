// The 사주풀이 body text should read without 사주 vocabulary: 십신 names, 십신 group names
// and structure words (원국, 월지, 일지, 천간, 지지 …) belong in the basis line under each
// paragraph, not in the paragraph. Widely known words (오행, 대운, 일주, 신살 names) are fine.
import { calculateSaju, wolunOfYear } from '../lib/saju';
import { ILGAN } from '../lib/content/ilgan';
import { ILJU } from '../lib/content/ilju';
import { DAEUN_THEME, FLOW_UNDERTONE, MONTH_THEME, YEAR_THEME } from '../lib/content/flow';
import { LOVE_BY_DAY_GOD, PERSONALITY_BY_MONTH_GOD, WEALTH_BY_JAESEONG } from '../lib/content/detail';
import { CAREER_BALANCED, CAREER_BY_GROUP, CAREER_STYLE_BY_MONTH_GOD, CAREER_TIP_BY_LACKING } from '../lib/content/career';
import { SINSAL, SINSAL_NONE, SINSAL_REPEATED } from '../lib/content/sinsal';
import { JOHU_ROLE, JOHU_SEASON } from '../lib/content/johu';
import { daeunFlow, monthFlow, yearFlow } from '../lib/flow';
import { johuOf } from '../lib/johu';

let pass = 0, fail = 0;
const ok = (label: string, cond: boolean, extra?: unknown) => (cond ? pass++ : (fail++, console.log('FAIL', label, extra ?? '')));

const TERMS = [
  '비견', '겁재', '식신', '상관', '편재', '정재', '편관', '정관', '편인', '정인',
  '비겁', '식상', '재성', '관성', '인성',
  '원국', '월지', '일지', '년지', '시지', '천간', '지지', '본기', '지장간', '일간',
];
// A term counts only at the start of a word, so "커지지만" or "익숙해지지" don't trip on 지지.
const found = (s: string) => TERMS.filter((t) => new RegExp(`(^|[^가-힣])${t}`).test(s));
const plain = (label: string, text: string) => ok(label, found(text).length === 0, [found(text), text.slice(0, 60)]);

const strings = (v: unknown): string[] => (typeof v === 'string' ? [v] : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : []);
const blocks: Record<string, unknown> = {
  ILGAN, ILJU, YEAR_THEME, MONTH_THEME, DAEUN_THEME, FLOW_UNDERTONE,
  PERSONALITY_BY_MONTH_GOD, WEALTH_BY_JAESEONG, LOVE_BY_DAY_GOD,
  CAREER_BY_GROUP, CAREER_BALANCED, CAREER_STYLE_BY_MONTH_GOD, CAREER_TIP_BY_LACKING,
  SINSAL, SINSAL_NONE, SINSAL_REPEATED, JOHU_SEASON, JOHU_ROLE,
};
for (const [name, block] of Object.entries(blocks)) for (const s of strings(block)) plain(name, s);

// Sentences assembled in code
let seed = 53; const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
for (let i = 0; i < 400; i++) {
  const s = calculateSaju({
    gender: rnd() > 0.5 ? 'male' : 'female', year: 1940 + Math.floor(rnd() * 80), month: 1 + Math.floor(rnd() * 12), day: 1 + Math.floor(rnd() * 28),
    hour: Math.floor(rnd() * 24), minute: 0, calendarType: 'solar',
  });
  const flows = [yearFlow(s, 2026), monthFlow(s, wolunOfYear(2026)[i % 12]), ...s.daeun.slice(0, 2).map((d) => daeunFlow(s, d))];
  for (const f of flows) {
    plain('flow title', f.title);
    plain('flow body', f.body);
    plain('flow note', f.note);
    ok('flow term label and basis carry the 십신', f.godLabel.includes(f.ganGod) && f.basis.includes(f.ganGod) && f.basis.includes(f.zhiGod), f);
  }
  const j = johuOf(s, new Date(2026, 9, 1));
  plain('조후 presence line', j.presenceLine);
  plain('조후 timing line', j.timingLine);
}

console.log(`verify-plain-language: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
