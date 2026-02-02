import { describe, expect, it, beforeEach } from 'vitest';
import { loadStore, resetStore, saveStore, STORAGE_KEY } from '../src/storage/storage';
import { seedExercises } from '../src/seed';
import { StoreData } from '../src/types';

describe('storage', () => {
  beforeEach(() => {
    resetStore();
  });

  it('seeds exercises on empty store', () => {
    const store = loadStore();
    expect(store.exercises).toHaveLength(seedExercises.length);
  });

  it('loads saved store data', () => {
    const custom: StoreData = {
      version: 1,
      exercises: seedExercises,
      routines: [],
      reminders: [],
      logs: [],
      settings: { soundEnabled: false, vibrationEnabled: false, reducedMotion: true }
    };
    saveStore(custom);
    const loaded = loadStore();
    expect(loaded.settings.reducedMotion).toBe(true);
  });

  it('handles invalid JSON gracefully', () => {
    window.localStorage.setItem(STORAGE_KEY, '{bad-json');
    const store = loadStore();
    expect(store.exercises.length).toBe(seedExercises.length);
  });
});
