import type { BirthInput } from './saju';

export const RELATIONS = ['가족', '친구', '연인', '직장', '기타'] as const;
export type Relation = (typeof RELATIONS)[number];

export const NAME_MAX_LENGTH = 20;
export const MEMO_MAX_LENGTH = 200;

/** One saved chart. Exactly one person has isSelf = true ("나"). */
export type Person = BirthInput & {
  id: string;
  name: string;
  isSelf: boolean;
  /** null for the user themself. */
  relation: Relation | null;
  memo: string;
  favorite: boolean;
  createdAt: number;
  updatedAt: number;
  /** Used for "최근 본 순"; null until the person has been opened. */
  lastViewedAt: number | null;
};

/** What the input form produces. */
export type PersonInput = BirthInput & { name: string; relation?: Relation | null; memo?: string };

export function newPersonId(now: number = Date.now()): string {
  return `${now.toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

const isInt = (n: unknown) => Number.isInteger(n);

export function isPerson(v: unknown): v is Person {
  const p = v as Person | null;
  return (
    !!p &&
    typeof p.id === 'string' &&
    p.id.length > 0 &&
    typeof p.name === 'string' &&
    typeof p.isSelf === 'boolean' &&
    (p.relation === null || (RELATIONS as readonly string[]).includes(p.relation)) &&
    typeof p.memo === 'string' &&
    typeof p.favorite === 'boolean' &&
    isInt(p.createdAt) &&
    isInt(p.updatedAt) &&
    (p.lastViewedAt === null || isInt(p.lastViewedAt)) &&
    (p.gender === 'male' || p.gender === 'female') &&
    (p.calendarType === 'solar' || p.calendarType === 'lunar') &&
    [p.year, p.month, p.day].every(isInt) &&
    (p.hour === null || isInt(p.hour)) &&
    (p.minute === null || isInt(p.minute)) &&
    (p.isLeapMonth === undefined || typeof p.isLeapMonth === 'boolean')
  );
}

/** Reads a saved list defensively: invalid entries and a second "나" are dropped. */
export function parsePeople(raw: unknown): Person[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  let hasSelf = false;
  const out: Person[] = [];
  for (const item of raw) {
    if (!isPerson(item) || seen.has(item.id)) continue;
    if (item.isSelf) {
      if (hasSelf) continue;
      hasSelf = true;
    }
    seen.add(item.id);
    out.push(item);
  }
  return out;
}

/** The single-profile format used before the 사주 목록 existed. */
export function personFromLegacyProfile(legacy: unknown, now: number = Date.now()): Person | null {
  const p = legacy as (BirthInput & { name?: unknown }) | null;
  if (!p || typeof p.name !== 'string') return null;
  const candidate: Person = {
    ...(p as BirthInput),
    id: newPersonId(now),
    name: p.name,
    isSelf: true,
    relation: null,
    memo: '',
    favorite: false,
    createdAt: now,
    updatedAt: now,
    lastViewedAt: null,
  };
  return isPerson(candidate) ? candidate : null;
}

export const findSelf = (people: Person[]): Person | null => people.find((p) => p.isSelf) ?? null;

/** The person being viewed: the chosen one if it still exists, otherwise "나". */
export function resolveActive(people: Person[], activeId: string | null): Person | null {
  return (activeId ? people.find((p) => p.id === activeId) : undefined) ?? findSelf(people);
}

const clean = (input: PersonInput) => ({
  ...input,
  name: input.name.trim().slice(0, NAME_MAX_LENGTH),
  // undefined = "leave the saved memo alone" (the form for "나" has no memo field)
  memo: input.memo === undefined ? undefined : input.memo.trim().slice(0, MEMO_MAX_LENGTH),
});

/** Creates "나" or replaces the birth data of the existing "나". */
export function upsertSelf(people: Person[], input: PersonInput, now: number = Date.now(), id: string = newPersonId(now)): Person[] {
  const c = clean(input);
  const self = findSelf(people);
  if (self) {
    return people.map((p) => (p.id === self.id ? { ...p, ...c, memo: c.memo ?? p.memo, isSelf: true, relation: null, id: self.id, updatedAt: now } : p));
  }
  const created: Person = { ...c, id, isSelf: true, relation: null, memo: c.memo ?? '', favorite: false, createdAt: now, updatedAt: now, lastViewedAt: null };
  return [created, ...people];
}

export function addPerson(people: Person[], input: PersonInput, now: number = Date.now(), id: string = newPersonId(now)): Person[] {
  const c = clean(input);
  const created: Person = { ...c, id, isSelf: false, relation: input.relation ?? '기타', memo: c.memo ?? '', favorite: false, createdAt: now, updatedAt: now, lastViewedAt: null };
  return [...people, created];
}

export function updatePerson(people: Person[], id: string, input: PersonInput, now: number = Date.now()): Person[] {
  const c = clean(input);
  return people.map((p) =>
    p.id === id ? { ...p, ...c, memo: c.memo ?? p.memo, id: p.id, isSelf: p.isSelf, relation: p.isSelf ? null : input.relation ?? p.relation ?? '기타', favorite: p.favorite, updatedAt: now } : p,
  );
}

/** "나" can't be removed. */
export function removePerson(people: Person[], id: string): Person[] {
  return people.filter((p) => p.id !== id || p.isSelf);
}

export function toggleFavorite(people: Person[], id: string, now: number = Date.now()): Person[] {
  return people.map((p) => (p.id === id && !p.isSelf ? { ...p, favorite: !p.favorite, updatedAt: now } : p));
}

export function markViewed(people: Person[], id: string, now: number = Date.now()): Person[] {
  return people.map((p) => (p.id === id ? { ...p, lastViewedAt: now } : p));
}

export type SortMode = 'recent' | 'name';

const byRecent = (a: Person, b: Person) => (b.lastViewedAt ?? b.createdAt) - (a.lastViewedAt ?? a.createdAt);
const byName = (a: Person, b: Person) => a.name.localeCompare(b.name, 'ko');

export type PersonGroups = { me: Person | null; favorites: Person[]; others: Person[] };

/** Search text matches the name or the memo; relation filter is exact. */
export function groupPeople(
  people: Person[],
  opts: { query?: string; relation?: Relation | null; sort?: SortMode } = {},
): PersonGroups {
  const q = (opts.query ?? '').trim().toLowerCase();
  const cmp = opts.sort === 'name' ? byName : byRecent;
  const match = (p: Person) =>
    (!opts.relation || p.relation === opts.relation) &&
    (q === '' || p.name.toLowerCase().includes(q) || p.memo.toLowerCase().includes(q));
  const others = people.filter((p) => !p.isSelf && match(p));
  return {
    me: findSelf(people),
    favorites: others.filter((p) => p.favorite).sort(cmp),
    others: others.filter((p) => !p.favorite).sort(cmp),
  };
}

export function relationCounts(people: Person[]): Record<Relation, number> {
  const out = Object.fromEntries(RELATIONS.map((r) => [r, 0])) as Record<Relation, number>;
  for (const p of people) if (p.relation) out[p.relation] += 1;
  return out;
}
