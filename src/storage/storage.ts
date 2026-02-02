import { seedExercises } from '../seed';
import { StoreData } from '../types';

const STORAGE_KEY = 'bp_breathing_app_v1';
const CURRENT_VERSION = 1;

const defaultStore = (): StoreData => ({
  version: CURRENT_VERSION,
  exercises: seedExercises,
  routines: [],
  reminders: [],
  logs: [],
  settings: {
    soundEnabled: true,
    vibrationEnabled: true,
    reducedMotion: false
  }
});

const migrate = (data: unknown): StoreData => {
  if (!data || typeof data !== 'object') return defaultStore();
  const store = data as Partial<StoreData>;
  if (store.version === CURRENT_VERSION) {
    return {
      ...defaultStore(),
      ...store,
      exercises: store.exercises && store.exercises.length ? store.exercises : seedExercises
    } as StoreData;
  }
  return defaultStore();
};

export const loadStore = (): StoreData => {
  if (typeof window === 'undefined') return defaultStore();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultStore();
  try {
    return migrate(JSON.parse(raw));
  } catch {
    return defaultStore();
  }
};

export const saveStore = (store: StoreData) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

export const resetStore = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
};

export const updateStore = (updater: (store: StoreData) => StoreData): StoreData => {
  const current = loadStore();
  const next = updater(current);
  saveStore(next);
  return next;
};

export const seedIfEmpty = (): StoreData => {
  const current = loadStore();
  if (!current.exercises.length) {
    const seeded = defaultStore();
    saveStore(seeded);
    return seeded;
  }
  return current;
};

export { STORAGE_KEY, CURRENT_VERSION };
