import {
  Person, PersonInput, RELATIONS, addPerson, findSelf, groupPeople, isPerson, markViewed, parsePeople,
  personFromLegacyProfile, relationCounts, removePerson, resolveActive, toggleFavorite, updatePerson, upsertSelf,
} from '../lib/people';
import { calculateSaju, DEFAULT_SAJU_OPTIONS } from '../lib/saju';
import { shortBirthDate, summarizePerson } from '../lib/personSummary';

let pass = 0, fail = 0;
const ok = (label: string, cond: boolean, extra?: unknown) => (cond ? pass++ : (fail++, console.log('FAIL', label, extra ?? '')));

const birth = { gender: 'female' as const, calendarType: 'solar' as const, year: 1995, month: 6, day: 15, hour: 12, minute: 0 };
const input = (name: string, extra: Partial<PersonInput> = {}): PersonInput => ({ ...birth, name, ...extra });

// ---- self ----
let list: Person[] = [];
list = upsertSelf(list, input('민서'), 1000, 'me');
ok('self created', list.length === 1 && list[0].isSelf && list[0].id === 'me' && list[0].relation === null && list[0].createdAt === 1000);
ok('resolveActive falls back to self', resolveActive(list, null)?.id === 'me' && resolveActive(list, 'ghost')?.id === 'me');

list = upsertSelf(list, input('민서2', { year: 1992 }), 2000, 'other-id');
ok('upsertSelf updates in place', list.length === 1 && list[0].id === 'me' && list[0].name === '민서2' && list[0].year === 1992 && list[0].createdAt === 1000 && list[0].updatedAt === 2000);
ok('name trimmed and capped', upsertSelf([], input('  ' + 'x'.repeat(40) + '  '), 1, 'a')[0].name.length === 20);

// ---- add / update / remove ----
list = addPerson(list, input('지훈', { relation: '친구', memo: ' 동창 ' }), 3000, 'p1');
list = addPerson(list, input('엄마', { relation: '가족' }), 3100, 'p2');
list = addPerson(list, input('수아', { relation: '연인' }), 3200, 'p3');
ok('added 3 people', list.length === 4 && list.filter((p) => p.isSelf).length === 1);
ok('memo trimmed / default relation', list[1].memo === '동창' && addPerson([], input('x'), 1, 'z')[0].relation === '기타');

list = updatePerson(list, 'p1', input('지훈이', { relation: '직장', month: 7 }), 4000);
const p1 = list.find((p) => p.id === 'p1')!;
ok('update keeps identity and memo', p1.name === '지훈이' && p1.relation === '직장' && p1.month === 7 && p1.memo === '동창' && p1.createdAt === 3000 && !p1.isSelf);
ok('updating a person cannot make them self', updatePerson(list, 'p2', input('엄마', { relation: '가족' }), 1).filter((p) => p.isSelf).length === 1);
ok('self relation stays null on update', updatePerson(list, 'me', input('민서', { relation: '가족' }), 1).find((p) => p.isSelf)!.relation === null);

ok('cannot remove self', removePerson(list, 'me').length === 4);
ok('remove person', removePerson(list, 'p2').length === 3 && !removePerson(list, 'p2').some((p) => p.id === 'p2'));

// ---- favorites / viewed ----
list = toggleFavorite(list, 'p2', 5000);
list = toggleFavorite(list, 'p3', 5000);
list = toggleFavorite(list, 'me', 5000);
ok('favorite toggles, self ignored', list.find((p) => p.id === 'p2')!.favorite && list.find((p) => p.id === 'p3')!.favorite && !list.find((p) => p.id === 'me')!.favorite);
ok('unfavorite', !toggleFavorite(list, 'p2', 1).find((p) => p.id === 'p2')!.favorite);
list = markViewed(list, 'p1', 9000);
ok('markViewed sets lastViewedAt', list.find((p) => p.id === 'p1')!.lastViewedAt === 9000);

// ---- grouping / search ----
let g = groupPeople(list);
ok('groups: me, favorites, others', g.me?.id === 'me' && g.favorites.map((p) => p.id).sort().join() === 'p2,p3' && g.others.map((p) => p.id).join() === 'p1');
ok('recent sort: viewed first', groupPeople(list, { sort: 'recent' }).favorites[0].id === 'p3'); // p3 created later than p2, neither viewed
list = markViewed(list, 'p2', 9500);
ok('recent sort follows lastViewedAt', groupPeople(list).favorites[0].id === 'p2');
ok('name sort', groupPeople(list, { sort: 'name' }).favorites.map((p) => p.name).join() === '수아,엄마');
ok('relation filter', groupPeople(list, { relation: '가족' }).favorites.map((p) => p.id).join() === 'p2' && groupPeople(list, { relation: '가족' }).others.length === 0);
ok('search by name', groupPeople(list, { query: '수' }).favorites.map((p) => p.id).join() === 'p3');
ok('search by memo', groupPeople(list, { query: '동창' }).others.map((p) => p.id).join() === 'p1');
ok('search is case-insensitive and trimmed', groupPeople(addPerson(list, input('Alex'), 1, 'p9'), { query: '  aLEx ' }).others.map((p) => p.id).join() === 'p9');
ok('empty result', groupPeople(list, { query: 'zzz' }).favorites.length === 0 && groupPeople(list, { query: 'zzz' }).others.length === 0);
ok('self never filtered out of group', groupPeople(list, { query: 'zzz' }).me?.id === 'me');
const counts = relationCounts(list);
ok('relation counts', counts['가족'] === 1 && counts['연인'] === 1 && counts['직장'] === 1 && counts['친구'] === 0 && Object.keys(counts).length === RELATIONS.length);

// ---- active ----
ok('active chosen person', resolveActive(list, 'p3')?.id === 'p3');
ok('active removed → self', resolveActive(removePerson(list, 'p3'), 'p3')?.id === 'me');
ok('no people → null', resolveActive([], null) === null && findSelf([]) === null);

// ---- storage parsing & migration ----
ok('parse valid', parsePeople(JSON.parse(JSON.stringify(list))).length === list.length);
ok('parse junk', parsePeople(null).length === 0 && parsePeople('x').length === 0 && parsePeople({}).length === 0);
const broken = [...list, { id: 'bad' }, null, { ...list[1], hour: 'x' }, { ...list[1] } /* duplicate id */, { ...list[1], id: 'second-self', isSelf: true }];
const parsed = parsePeople(JSON.parse(JSON.stringify(broken)));
ok('parse drops invalid, duplicates and a second self', parsed.length === list.length && parsed.filter((p) => p.isSelf).length === 1, parsed.length);
ok('isPerson rejects bad relation', !isPerson({ ...list[1], relation: '이웃' }) && isPerson({ ...list[1], relation: '가족' }));

const legacy = { name: '뇨', gender: 'female', calendarType: 'lunar', year: 2017, month: 5, day: 14, hour: null, minute: null, isLeapMonth: true };
const migrated = personFromLegacyProfile(legacy, 7000)!;
ok('legacy profile → self', !!migrated && migrated.isSelf && migrated.name === '뇨' && migrated.isLeapMonth === true && migrated.relation === null && migrated.createdAt === 7000 && isPerson(migrated));
ok('legacy junk rejected', personFromLegacyProfile(null) === null && personFromLegacyProfile({ name: 5 }) === null && personFromLegacyProfile({ name: 'x', gender: 'z' }) === null);

// ---- the engine accepts a Person directly (context passes it as-is) ----
const before = JSON.stringify(calculateSaju(birth, { longitudeCorrection: true, jasi: 'yajasi' }));
const after = JSON.stringify(calculateSaju(list.find((p) => p.id === 'p3')!, { longitudeCorrection: true, jasi: 'yajasi' }));
ok('calculateSaju works on a Person', before === after);

// ---- list row labels ----
ok('shortBirthDate solar', shortBirthDate({ year: 1995, month: 6, day: 5, calendarType: 'solar' }) === '1995.06.05');
ok('shortBirthDate lunar / leap', shortBirthDate({ year: 2017, month: 5, day: 14, calendarType: 'lunar' }) === '2017.05.14 (음)' && shortBirthDate({ year: 2017, month: 5, day: 14, calendarType: 'lunar', isLeapMonth: true }) === '2017.05.14 (음·윤)');
const sum = summarizePerson(list.find((p) => p.id === 'p3')!, DEFAULT_SAJU_OPTIONS)!;
const ref = calculateSaju(birth, DEFAULT_SAJU_OPTIONS);
ok('summary matches the engine', sum.gan === ref.dayGan && sum.iljuHanja === ref.day.ganZhi && sum.iljuHangul === ref.day.hangul && sum.ganElement === ref.dayGanElement);
ok('summary is null for an impossible lunar date', summarizePerson({ ...list[1], calendarType: 'lunar', year: 2017, month: 4, day: 5, isLeapMonth: true }, DEFAULT_SAJU_OPTIONS) === null);

console.log(`verify-people: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
