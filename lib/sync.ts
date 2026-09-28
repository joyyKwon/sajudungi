import { supabase } from './supabase';
import { Person, isPerson } from './people';

export { mergePeopleOnLogin, mergeProgressOnLogin } from './syncMerge';

/**
 * Syncs the 사주 목록 and 학습 진도 of a logged-in user with `public.people` /
 * `public.progress` (see supabase/migrations/20260928000000_user_data.sql).
 *
 * Policy (deliberately simple — see lib/syncMerge.ts's note on mergePeopleOnLogin): the
 * device that is currently signed in is treated as the source of truth for its own edits,
 * and a full upsert-and-prune runs after every local change so the server always mirrors the
 * device. Two devices editing the same account at the same time while offline from each
 * other can still race (whichever pushes last wins); that's a known limitation, not
 * something this file tries to solve.
 */

export async function fetchRemotePeople(userId: string): Promise<Person[]> {
  const { data, error } = await supabase.from('people').select('data').eq('user_id', userId).is('deleted_at', null);
  if (error || !data) return [];
  return data.map((row) => row.data as unknown).filter(isPerson);
}

export async function fetchRemoteProgress(userId: string): Promise<string[]> {
  const { data, error } = await supabase.from('progress').select('completed_lesson_ids').eq('user_id', userId).maybeSingle();
  if (error || !data) return [];
  const ids = data.completed_lesson_ids;
  return Array.isArray(ids) ? ids.filter((v): v is string => typeof v === 'string') : [];
}

/** Makes the server's people rows match `people` exactly: upserts each, deletes the rest. */
export async function pushAllPeople(userId: string, people: Person[]): Promise<void> {
  if (people.length > 0) {
    const rows = people.map((p) => ({ id: p.id, user_id: userId, data: p, updated_at: new Date(p.updatedAt).toISOString() }));
    const { error } = await supabase.from('people').upsert(rows);
    if (error) return; // offline or transient failure: leave the server as it was, try again on the next change
  }
  const { data: existing } = await supabase.from('people').select('id').eq('user_id', userId);
  const keep = new Set(people.map((p) => p.id));
  const toDelete = (existing ?? []).map((r) => r.id as string).filter((id) => !keep.has(id));
  if (toDelete.length > 0) await supabase.from('people').delete().eq('user_id', userId).in('id', toDelete);
}

export async function pushProgress(userId: string, completed: string[]): Promise<void> {
  await supabase.from('progress').upsert({ user_id: userId, completed_lesson_ids: completed });
}
