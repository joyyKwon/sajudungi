import { Person } from '../lib/people';
import { mergePeopleOnLogin, mergeProgressOnLogin } from '../lib/syncMerge';

let pass = 0, fail = 0;
const ok = (label: string, cond: boolean, extra?: unknown) => (cond ? pass++ : (fail++, console.log('FAIL', label, extra ?? '')));

const base = { gender: 'female', calendarType: 'solar', year: 1995, month: 6, day: 15, hour: 12, minute: 0 } as const;
const person = (id: string, over: Partial<Person> = {}): Person => ({
  ...base,
  id,
  name: id,
  isSelf: false,
  relation: '친구',
  memo: '',
  favorite: false,
  createdAt: 1,
  updatedAt: 1,
  lastViewedAt: null,
  ...over,
});
const self = (id: string, over: Partial<Person> = {}): Person => person(id, { isSelf: true, relation: null, ...over });

// ---- brand new account: server has nothing yet, device's own list goes up untouched ----
const localOnly = [self('me-local'), person('p1'), person('p2')];
{
  const merged = mergePeopleOnLogin(localOnly, []);
  ok('new account: local list kept as-is (by id)', new Set(merged.map((p) => p.id)).size === 3 && merged.every((p) => localOnly.some((l) => l.id === p.id)));
  ok('new account: exactly one self', merged.filter((p) => p.isSelf).length === 1 && merged.find((p) => p.isSelf)!.id === 'me-local');
}

// ---- existing account: server's own self wins over the device's, even though ids differ ----
{
  const remote = [self('me-remote', { name: '서버의나' }), person('p1', { name: '서버지훈' })];
  const merged = mergePeopleOnLogin(localOnly, remote);
  const mergedSelf = merged.find((p) => p.isSelf)!;
  ok('existing account: server self replaces device self', mergedSelf.id === 'me-remote' && !merged.some((p) => p.id === 'me-local'));
  ok('existing account: still exactly one self', merged.filter((p) => p.isSelf).length === 1);
  ok('existing account: union of others by id', new Set(merged.map((p) => p.id)).size === 3, merged.map((p) => p.id));
}

// ---- same id on both sides: newer updatedAt wins ----
{
  const local = [self('me'), person('shared', { name: '로컬수정본', updatedAt: 100 })];
  const remote = [self('me'), person('shared', { name: '서버수정본', updatedAt: 50 })];
  const merged = mergePeopleOnLogin(local, remote);
  ok('conflict: newer local wins when local is newer', merged.find((p) => p.id === 'shared')!.name === '로컬수정본');

  const remote2 = [self('me'), person('shared', { name: '서버가더최신', updatedAt: 200 })];
  const merged2 = mergePeopleOnLogin(local, remote2);
  ok('conflict: newer remote wins when remote is newer', merged2.find((p) => p.id === 'shared')!.name === '서버가더최신');
}

// ---- disjoint additions from two devices are unioned, not lost ----
{
  const local = [self('me'), person('added-on-device-a')];
  const remote = [self('me'), person('added-on-device-b')];
  const merged = mergePeopleOnLogin(local, remote);
  ok('disjoint people from both sides are kept', ['added-on-device-a', 'added-on-device-b'].every((id) => merged.some((p) => p.id === id)));
  ok('disjoint merge: exactly one self, total 3', merged.length === 3 && merged.filter((p) => p.isSelf).length === 1);
}

// ---- neither side has a self yet: no self appears (shouldn't happen in practice, but must not crash) ----
{
  const merged = mergePeopleOnLogin([person('p1')], [person('p2')]);
  ok('no self anywhere: no self in result, others still merged', !merged.some((p) => p.isSelf) && merged.length === 2);
}

// ---- empty on both sides ----
ok('both empty → empty', mergePeopleOnLogin([], []).length === 0);

// ---- progress: plain union, de-duplicated ----
ok('progress union', new Set(mergeProgressOnLogin(['a', 'b'], ['b', 'c'])).size === 3);
ok('progress union has no duplicates', mergeProgressOnLogin(['a', 'a'], ['a']).length === 1);
ok('progress union: local only', mergeProgressOnLogin(['a', 'b'], []).sort().join() === 'a,b');
ok('progress union: remote only', mergeProgressOnLogin([], ['a', 'b']).sort().join() === 'a,b');
ok('progress union: both empty', mergeProgressOnLogin([], []).length === 0);

console.log(`verify-sync: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
