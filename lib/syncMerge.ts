import { Person } from './people';

/**
 * Merges the list this device had before login with what the server already has, for the
 * one-time reconciliation that runs right after signing in.
 *
 * "나" needs special handling: every device generates its own id for "나" locally, so two
 * devices' self-entries never share an id and a plain by-id merge would leave two people
 * flagged isSelf. The account's self entry wins once one exists on the server (a device
 * logging into an existing account should pick up that account's "나", not keep its own);
 * only a brand-new account (no server rows yet) takes the device's local self entry.
 *
 * Everyone else is merged by id: present on only one side → kept; present on both → the
 * newer `updatedAt` wins. Two devices that independently added someone with the same name
 * before ever syncing get two separate entries (there's no reliable way to tell those are
 * "the same person" without asking); merging those is left to the user in 사주 목록.
 *
 * Kept free of any Supabase/React Native import so it can run in plain Node (scripts/verify-sync.ts).
 */
export function mergePeopleOnLogin(local: Person[], remote: Person[]): Person[] {
  const localSelf = local.find((p) => p.isSelf) ?? null;
  const remoteSelf = remote.find((p) => p.isSelf) ?? null;
  const self = remoteSelf ?? localSelf;

  const byId = new Map<string, Person>();
  for (const p of remote) if (!p.isSelf) byId.set(p.id, p);
  for (const p of local) {
    if (p.isSelf) continue;
    const existing = byId.get(p.id);
    if (!existing || p.updatedAt > existing.updatedAt) byId.set(p.id, p);
  }
  return self ? [self, ...byId.values()] : [...byId.values()];
}

export function mergeProgressOnLogin(local: string[], remote: string[]): string[] {
  return [...new Set([...local, ...remote])];
}
