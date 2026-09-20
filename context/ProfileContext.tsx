import { createContext, useContext, useMemo, useState } from 'react';
import { BirthInput, Gender, CalendarType, DEFAULT_SAJU_OPTIONS, SajuOptions, SajuResult, calculateSaju } from '../lib/saju';

export type Profile = BirthInput & { name: string };

// MOCK: seeded with a sample profile so every screen has real (computed, not
// hardcoded) saju data to show before a user actually completes info-input.
// Replace with `null` as the default once Supabase auth + profile storage
// exists, and route unauthenticated users to onboarding instead.
const DEFAULT_PROFILE: Profile = {
  name: '서연',
  gender: 'female',
  year: 1996,
  month: 3,
  day: 14,
  hour: 15,
  minute: 30,
  calendarType: 'solar',
};

type ProfileContextValue = {
  profile: Profile;
  setProfile: (profile: Profile) => void;
  options: SajuOptions;
  setOptions: (options: SajuOptions) => void;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [options, setOptions] = useState<SajuOptions>(DEFAULT_SAJU_OPTIONS);
  const value = useMemo(() => ({ profile, setProfile, options, setOptions }), [profile, options]);
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within a ProfileProvider');
  return ctx;
}

/** Saju for the current profile, recomputed when the profile or calc options change. */
export function useSaju(): SajuResult {
  const { profile, options } = useProfile();
  return useMemo(() => calculateSaju(profile, options), [profile, options]);
}

export type { Gender, CalendarType };
