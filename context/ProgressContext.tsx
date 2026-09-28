import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { STORAGE_KEYS, loadJson, removeKeys, saveJson } from '../lib/storage';

type ProgressContextValue = {
  completed: string[];
  markDone: (lessonId: string) => void;
  /** Clears learning progress from this device. */
  resetProgress: () => void;
  /** Replaces the whole completed-lesson list at once (used by lib/sync.ts). */
  replaceCompleted: (ids: string[]) => void;
  ready: boolean;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [completed, setCompleted] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await loadJson<string[]>(STORAGE_KEYS.lessons);
      if (Array.isArray(saved)) setCompleted(saved.filter((v) => typeof v === 'string'));
      setReady(true);
    })();
  }, []);

  const value = useMemo<ProgressContextValue>(
    () => ({
      completed,
      markDone: (lessonId) =>
        setCompleted((prev) => {
          if (prev.includes(lessonId)) return prev;
          const next = [...prev, lessonId];
          saveJson(STORAGE_KEYS.lessons, next);
          return next;
        }),
      resetProgress: () => {
        setCompleted([]);
        removeKeys([STORAGE_KEYS.lessons]);
      },
      replaceCompleted: (ids) => {
        setCompleted(ids);
        saveJson(STORAGE_KEYS.lessons, ids);
      },
      ready,
    }),
    [completed, ready],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within a ProgressProvider');
  return ctx;
}
