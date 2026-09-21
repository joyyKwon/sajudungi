import { supabase } from './supabase';
import { CONTENT_SCHEMA_VERSION } from './content/bundled';
import { STORAGE_KEYS, loadJson, saveJson } from './storage';
import type { ContentRow } from './contentMerge';

const FETCH_TIMEOUT_MS = 8000;

export async function loadCachedContentRows(): Promise<ContentRow[]> {
  const saved = await loadJson<ContentRow[]>(STORAGE_KEYS.content);
  return Array.isArray(saved) ? saved : [];
}

/** Returns the latest rows, or null when offline / the request fails. */
export async function fetchContentRows(): Promise<ContentRow[] | null> {
  try {
    const request = supabase.from('content_blocks').select('key, value').eq('schema_version', CONTENT_SCHEMA_VERSION);
    const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), FETCH_TIMEOUT_MS));
    const { data, error } = await Promise.race([request, timeout]);
    if (error || !Array.isArray(data)) return null;
    saveJson(STORAGE_KEYS.content, data);
    return data as ContentRow[];
  } catch {
    return null;
  }
}
