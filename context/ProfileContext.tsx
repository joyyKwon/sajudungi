import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { BirthInput, Gender, CalendarType, DEFAULT_SAJU_OPTIONS, SajuOptions, SajuResult, calculateSaju } from '../lib/saju';
import { STORAGE_KEYS, loadJson, saveJson } from '../lib/storage';

export type Profile = BirthInput & { name: string };

type ProfileContextValue = {
  /** null until the user completes info-input. */
  profile: Profile | null;
  setProfile: (profile: Profile) => void;
  options: SajuOptions;
  setOptions: (options: SajuOptions) => void;
  /** True once saved data has been read from storage. */
  ready: boolean;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

function isProfile(v: unknown): v is Profile {
  const p = v as Profile | null;
  return (
    !!p &&
    typeof p.name === 'string' &&
    (p.gender === 'male' || p.gender === 'female') &&
    (p.calendarType === 'solar' || p.calendarType === 'lunar') &&
    [p.year, p.month, p.day].every((n) => Number.isInteger(n)) &&
    (p.hour === null || Number.isInteger(p.hour)) &&
    (p.minute === null || Number.isInteger(p.minute))
  );
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [options, setOptionsState] = useState<SajuOptions>(DEFAULT_SAJU_OPTIONS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const [savedProfile, savedOptions] = await Promise.all([
        loadJson<Profile>(STORAGE_KEYS.profile),
        loadJson<SajuOptions>(STORAGE_KEYS.options),
      ]);
      if (isProfile(savedProfile)) setProfileState(savedProfile);
      if (savedOptions && typeof savedOptions.longitudeCorrection === 'boolean' && (savedOptions.jasi === 'yajasi' || savedOptions.jasi === 'jojasi')) {
        setOptionsState({ longitudeCorrection: savedOptions.longitudeCorrection, jasi: savedOptions.jasi });
      }
      setReady(true);
    })();
  }, []);

  const value = useMemo<ProfileContextValue>(
    () => ({
      profile,
      setProfile: (next) => {
        setProfileState(next);
        saveJson(STORAGE_KEYS.profile, next);
      },
      options,
      setOptions: (next) => {
        setOptionsState(next);
        saveJson(STORAGE_KEYS.options, next);
      },
      ready,
    }),
    [profile, options, ready],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within a ProfileProvider');
  return ctx;
}

/** For screens that are only reachable once a profile exists (route guards enforce this). */
export function useRequiredProfile(): Profile {
  const { profile } = useProfile();
  if (!profile) throw new Error('This screen requires a saved profile');
  return profile;
}

/** Saju for the current profile, recomputed when the profile or calc options change. */
export function useSaju(): SajuResult {
  const profile = useRequiredProfile();
  const { options } = useProfile();
  return useMemo(() => calculateSaju(profile, options), [profile, options]);
}

export type { Gender, CalendarType };
