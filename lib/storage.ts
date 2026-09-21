import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  /** Pre-사주 목록 single profile; migrated into `people` on first launch. */
  profile: 'sajudungi.profile.v1',
  people: 'sajudungi.people.v1',
  options: 'sajudungi.options.v1',
  lessons: 'sajudungi.lessons.v1',
  content: 'sajudungi.content.v1',
  consent: 'sajudungi.consent.v1',
} as const;

export async function loadJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function saveJson(key: string, value: unknown) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage failures shouldn't break the session; the value just won't survive a restart.
  }
}

export async function removeKeys(keys: string[]) {
  try {
    await AsyncStorage.multiRemove(keys);
  } catch {
    // Best effort; callers also reset in-memory state.
  }
}
