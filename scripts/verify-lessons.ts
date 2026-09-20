import { LESSONS } from '../lib/lessons';
import { resolveCard } from '../lib/lessonCards';
import { calculateSaju } from '../lib/saju';

let pass = 0, fail = 0;
const ok = (label: string, cond: boolean, extra?: unknown) => (cond ? pass++ : (fail++, console.log('FAIL', label, extra ?? '')));

const chart = calculateSaju({ gender: 'female', year: 1996, month: 3, day: 14, hour: 15, minute: 30, calendarType: 'solar' });
const noHour = calculateSaju({ gender: 'female', year: 1996, month: 3, day: 14, hour: null, minute: null, calendarType: 'solar' });

// structure
ok('6 lessons', LESSONS.length === 6);
ok('unique ids', new Set(LESSONS.map((l) => l.id)).size === LESSONS.length);
for (const l of LESSONS) {
  ok(`${l.id} has cards`, l.cards.length >= 3);
  for (const c of l.cards) {
    ok(`${l.id}/${c.title} title`, c.title.trim().length > 0);
    ok(`${l.id}/${c.title} body or personal`, !!c.personal || c.body.trim().length > 0);
    for (const chip of c.chips ?? []) ok(`${l.id}/${c.title} chip glyph`, chip.glyph.length > 0);
  }
}
// static chip-count checks
const chipsOf = (id: string, i: number) => LESSONS.find((l) => l.id === id)!.cards[i].chips!;
ok('천간 10 chips', chipsOf('2', 0).length === 10);
ok('지지 12 chips', chipsOf('3', 0).length === 12 && chipsOf('3', 2).length === 12);
ok('십신 10 chips', chipsOf('6', 2).length === 10);
ok('60갑자 sample chips', chipsOf('3', 3).length === 5);

// personalization
for (const l of LESSONS) for (const c of l.cards) if (c.personal) {
  const r = resolveCard(c, chart);
  console.log(`[${l.id}/${c.personal}]`, r.body, '|', (r.chips ?? []).map((x) => `${x.glyph}:${(x.caption ?? '').replace('\n', ' ')}`).join(' '));
  ok(`${c.personal} body`, r.body.length > 10 && !r.body.includes('undefined'));
  ok(`${c.personal} chips`, (r.chips?.length ?? 0) > 0);
}
const el = resolveCard(LESSONS[3].cards[3], chart).chips!;
ok('elements chip total = 8 chars', el.reduce((a, c) => a + Number(c.caption!.replace('개', '')), 0) === 8);
const el6 = resolveCard(LESSONS[3].cards[3], noHour);
ok('elements chip total = 6 chars without hour', el6.chips!.reduce((a, c) => a + Number(c.caption!.replace('개', '')), 0) === 6);
ok('mentions 6 chars', el6.body.includes('여섯 글자'));
ok('tenGods excludes day pillar', resolveCard(LESSONS[5].cards[3], chart).chips!.length === 3 && resolveCard(LESSONS[5].cards[3], noHour).chips!.length === 2);
console.log(`${pass} passed, ${fail} failed`);
