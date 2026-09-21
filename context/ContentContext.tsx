import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { BUNDLED_CONTENT, ContentBundle } from '../lib/content/bundled';
import { mergeRemoteContent, ContentRow } from '../lib/contentMerge';
import { setContent } from '../lib/contentStore';
import { fetchContentRows, loadCachedContentRows } from '../lib/contentRemote';

type ContentContextValue = { content: ContentBundle; ready: boolean };

const ContentContext = createContext<ContentContextValue | null>(null);

function apply(rows: ContentRow[]): ContentBundle {
  const { bundle, report } = mergeRemoteContent(rows);
  if (__DEV__ && (report.rejected.length > 0 || report.unknownKeys.length > 0)) {
    console.warn('[content] ignored server text', report);
  }
  setContent(bundle);
  return bundle;
}

// Text comes from three layers: the copy built into the app, the copy cached
// from the last successful fetch (applied before the splash hides), and a fresh
// fetch in the background that updates screens when it arrives.
export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setBundle] = useState<ContentBundle>(BUNDLED_CONTENT);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const cached = await loadCachedContentRows();
      if (alive && cached.length > 0) setBundle(apply(cached));
      if (alive) setReady(true);

      const fresh = await fetchContentRows();
      if (alive && fresh) setBundle(apply(fresh));
    })();
    return () => {
      alive = false;
    };
  }, []);

  const value = useMemo(() => ({ content, ready }), [content, ready]);
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

/** Screens call this so they re-render when newer text arrives from the server. */
export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent must be used within a ContentProvider');
  return ctx;
}
