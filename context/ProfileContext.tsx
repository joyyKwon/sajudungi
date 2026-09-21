import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { BirthInput, Gender, CalendarType, DEFAULT_SAJU_OPTIONS, SajuOptions, SajuResult, calculateSaju } from '../lib/saju';
import { STORAGE_KEYS, loadJson, removeKeys, saveJson } from '../lib/storage';
import {
  Person,
  PersonInput,
  addPerson as addPersonTo,
  findSelf,
  markViewed,
  parsePeople,
  personFromLegacyProfile,
  removePerson as removePersonFrom,
  resolveActive,
  toggleFavorite as toggleFavoriteIn,
  updatePerson as updatePersonIn,
  upsertSelf,
} from '../lib/people';

/** The chart currently shown: a Person without the list-management fields is enough for most screens. */
export type Profile = BirthInput & { name: string };

type ProfileContextValue = {
  /** Everyone saved in the 사주 목록, including "나". */
  people: Person[];
  /** "나". null until the user completes the first info-input. */
  me: Person | null;
  /** The person shown across the app: the chosen one, otherwise "나". */
  profile: Person | null;
  /** Chosen person's id; null means "나". Kept in memory only, so every launch starts on "나". */
  activeId: string | null;
  setActive: (id: string | null) => void;
  /** Creates or updates "나". */
  setProfile: (input: PersonInput) => void;
  addPerson: (input: PersonInput) => Person;
  updatePerson: (id: string, input: PersonInput) => void;
  removePerson: (id: string) => void;
  toggleFavorite: (id: string) => void;
  options: SajuOptions;
  setOptions: (options: SajuOptions) => void;
  /** Removes every saved person and the settings from this device. */
  resetProfile: () => void;
  /** True once saved data has been read from storage. */
  ready: boolean;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [people, setPeopleState] = useState<Person[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [options, setOptionsState] = useState<SajuOptions>(DEFAULT_SAJU_OPTIONS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const [savedPeople, legacyProfile, savedOptions] = await Promise.all([
        loadJson<unknown>(STORAGE_KEYS.people),
        loadJson<unknown>(STORAGE_KEYS.profile),
        loadJson<SajuOptions>(STORAGE_KEYS.options),
      ]);

      let list = parsePeople(savedPeople);
      if (savedPeople === null && legacyProfile) {
        // First launch after the 사주 목록 update: the old single profile becomes "나".
        const migrated = personFromLegacyProfile(legacyProfile);
        if (migrated) {
          list = [migrated];
          await saveJson(STORAGE_KEYS.people, list);
          removeKeys([STORAGE_KEYS.profile]);
        }
      }
      setPeopleState(list);

      if (savedOptions && typeof savedOptions.longitudeCorrection === 'boolean' && (savedOptions.jasi === 'yajasi' || savedOptions.jasi === 'jojasi')) {
        setOptionsState({ longitudeCorrection: savedOptions.longitudeCorrection, jasi: savedOptions.jasi });
      }
      setReady(true);
    })();
  }, []);

  const value = useMemo<ProfileContextValue>(() => {
    const commit = (next: Person[]) => {
      setPeopleState(next);
      saveJson(STORAGE_KEYS.people, next);
    };
    return {
      people,
      me: findSelf(people),
      profile: resolveActive(people, activeId),
      activeId,
      setActive: (id) => {
        setActiveId(id);
        if (id) commit(markViewed(people, id));
      },
      setProfile: (input) => commit(upsertSelf(people, input)),
      addPerson: (input) => {
        const next = addPersonTo(people, input);
        commit(next);
        return next[next.length - 1];
      },
      updatePerson: (id, input) => commit(updatePersonIn(people, id, input)),
      removePerson: (id) => {
        commit(removePersonFrom(people, id));
        if (id === activeId) setActiveId(null);
      },
      toggleFavorite: (id) => commit(toggleFavoriteIn(people, id)),
      options,
      setOptions: (next) => {
        setOptionsState(next);
        saveJson(STORAGE_KEYS.options, next);
      },
      resetProfile: () => {
        setPeopleState([]);
        setActiveId(null);
        setOptionsState(DEFAULT_SAJU_OPTIONS);
        removeKeys([STORAGE_KEYS.people, STORAGE_KEYS.profile, STORAGE_KEYS.options]);
      },
      ready,
    };
  }, [people, activeId, options, ready]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within a ProfileProvider');
  return ctx;
}

/** For screens that are only reachable once a profile exists (route guards enforce this). */
export function useRequiredProfile(): Person {
  const { profile } = useProfile();
  if (!profile) throw new Error('This screen requires a saved profile');
  return profile;
}

/** "나", for screens about the user themself (마이, lessons). */
export function useRequiredMe(): Person {
  const { me } = useProfile();
  if (!me) throw new Error('This screen requires a saved profile');
  return me;
}

/** Saju for the person being viewed, recomputed when they or the calc options change. */
export function useSaju(): SajuResult {
  const profile = useRequiredProfile();
  const { options } = useProfile();
  return useMemo(() => calculateSaju(profile, options), [profile, options]);
}

/** Saju for "나" regardless of who is being viewed. */
export function useMySaju(): SajuResult {
  const me = useRequiredMe();
  const { options } = useProfile();
  return useMemo(() => calculateSaju(me, options), [me, options]);
}

export type { Gender, CalendarType, Person, PersonInput };
