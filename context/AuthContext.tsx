import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as Linking from 'expo-linking';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
// mergePeopleOnLogin/mergeProgressOnLogin are pure logic (lib/syncMerge.ts) re-exported from here.
import { fetchRemotePeople, fetchRemoteProgress, mergePeopleOnLogin, mergeProgressOnLogin, pushAllPeople, pushProgress } from '../lib/sync';
import { useProfile } from './ProfileContext';
import { useProgress } from './ProgressContext';

type AuthResult = { error: string | null };

type AuthContextValue = {
  /** null when browsing as a guest. */
  session: Session | null;
  email: string | null;
  /** True once the stored session (if any) has been checked. */
  ready: boolean;
  /** True while a login/signup/merge is in flight, so screens can show a spinner and avoid double-submits. */
  busy: boolean;
  /** `needsEmailConfirmation` is true when the project requires clicking a confirmation email before the account is usable. */
  signUpWithEmail: (email: string, password: string) => Promise<AuthResult & { needsEmailConfirmation: boolean }>;
  signInWithEmail: (email: string, password: string) => Promise<AuthResult>;
  /** Ends the session. `wipeDevice` also clears the local 사주 목록/진도 (offered on 로그아웃; always true for 계정 삭제). */
  signOut: (wipeDevice: boolean) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<AuthResult>;
  /** Completes a password-reset link: call after handleRecoveryUrl has set the recovery session. */
  setNewPassword: (password: string) => Promise<AuthResult>;
  /** True while the app is showing the "새 비밀번호 설정" screen reached from an email link. */
  inRecovery: boolean;
  /** Reads a sajudungi://…#access_token=…&type=recovery link (from expo-linking) and, if it's
   *  a real recovery link, opens a recovery session. Call once when the app receives such a URL. */
  handleRecoveryUrl: (url: string) => Promise<boolean>;
  /** Marks the account for deletion (30일 유예) and signs out. `wipeDevice` per the 계정 삭제 dialog. */
  requestAccountDeletion: (wipeDevice: boolean) => Promise<AuthResult>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function parseRecoveryTokens(url: string): { access_token: string; refresh_token: string } | null {
  const hash = url.split('#')[1];
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  if (params.get('type') !== 'recovery') return null;
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  return access_token && refresh_token ? { access_token, refresh_token } : null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { people, replaceAllPeople } = useProfile();
  const { completed, replaceCompleted } = useProgress();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [inRecovery, setInRecovery] = useState(false);

  // Up-to-date snapshots for the async login handler below, which otherwise closes over
  // whatever `people`/`completed` were at the time the listener was registered.
  const peopleRef = useRef(people);
  const completedRef = useRef(completed);
  peopleRef.current = people;
  completedRef.current = completed;

  // Set while this file is the one writing to ProfileContext/ProgressContext (the initial
  // merge), so the push-on-change effects below don't immediately re-push what was just pulled.
  const applyingRemoteRef = useRef(false);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (alive) {
        setSession(data.session);
        setReady(true);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      if (event === 'PASSWORD_RECOVERY') {
        setInRecovery(true);
        return; // a recovery session is not a normal login: don't run the people/progress sync
      }
      setSession(next);
      if (event === 'SIGNED_IN' && next) void reconcileOnLogin(next.user.id);
      if (event === 'SIGNED_OUT') setInRecovery(false);
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function reconcileOnLogin(userId: string) {
    setBusy(true);
    try {
      await supabase.from('deletion_requests').delete().eq('user_id', userId); // logging back in cancels a pending 계정 삭제
      const [remotePeople, remoteProgress] = await Promise.all([fetchRemotePeople(userId), fetchRemoteProgress(userId)]);
      const mergedPeople = mergePeopleOnLogin(peopleRef.current, remotePeople);
      const mergedProgress = mergeProgressOnLogin(completedRef.current, remoteProgress);

      applyingRemoteRef.current = true;
      replaceAllPeople(mergedPeople);
      replaceCompleted(mergedProgress);
      applyingRemoteRef.current = false;

      await Promise.all([pushAllPeople(userId, mergedPeople), pushProgress(userId, mergedProgress)]);
    } finally {
      setBusy(false);
    }
  }

  // Mirrors later local edits to the server while logged in.
  useEffect(() => {
    if (!session || applyingRemoteRef.current) return;
    void pushAllPeople(session.user.id, people);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [people, session?.user.id]);

  useEffect(() => {
    if (!session || applyingRemoteRef.current) return;
    void pushProgress(session.user.id, completed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completed, session?.user.id]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      email: session?.user.email ?? null,
      ready,
      busy,
      inRecovery,
      signUpWithEmail: async (email, password) => {
        setBusy(true);
        const { data, error } = await supabase.auth.signUp({ email, password });
        setBusy(false);
        return { error: error?.message ?? null, needsEmailConfirmation: !error && !data.session };
      },
      signInWithEmail: async (email, password) => {
        setBusy(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        setBusy(false);
        return { error: error?.message ?? null };
      },
      signOut: async (wipeDevice) => {
        await supabase.auth.signOut();
        if (wipeDevice) {
          replaceAllPeople([]);
          replaceCompleted([]);
        }
      },
      requestPasswordReset: async (email) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: Linking.createURL('/auth/reset-password') });
        return { error: error?.message ?? null };
      },
      setNewPassword: async (password) => {
        const { error } = await supabase.auth.updateUser({ password });
        if (!error) {
          setInRecovery(false);
          await supabase.auth.signOut(); // require a fresh sign-in with the new password
        }
        return { error: error?.message ?? null };
      },
      handleRecoveryUrl: async (url) => {
        const tokens = parseRecoveryTokens(url);
        if (!tokens) return false;
        const { error } = await supabase.auth.setSession(tokens);
        if (!error) setInRecovery(true);
        return !error;
      },
      requestAccountDeletion: async (wipeDevice) => {
        const userId = session?.user.id;
        if (!userId) return { error: '로그인이 필요해요.' };
        const { error } = await supabase.from('deletion_requests').upsert({ user_id: userId, requested_at: new Date().toISOString() });
        if (error) return { error: error.message };
        await supabase.auth.signOut();
        if (wipeDevice) {
          replaceAllPeople([]);
          replaceCompleted([]);
        }
        return { error: null };
      },
    }),
    [session, ready, busy, inRecovery, replaceAllPeople, replaceCompleted],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
