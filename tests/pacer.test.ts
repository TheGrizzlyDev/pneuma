import { describe, expect, it } from 'vitest';
import { createPacer, getSnapshot, pause, resume, start, tick } from '../src/domain/pacer';
import { Phase } from '../src/types';

const phases: Phase[] = [
  { name: 'Inhale', seconds: 2, bubbleScale: 1, cue: 'in' },
  { name: 'Exhale', seconds: 2, bubbleScale: 0.7, cue: 'out' }
];

describe('pacer', () => {
  it('starts and advances phases', () => {
    const state = createPacer(phases, 8);
    const started = start(state, new Date('2024-01-01T00:00:00Z'));
    const ticked = tick(started, new Date('2024-01-01T00:00:03Z'));
    const snapshot = getSnapshot(ticked);
    expect(snapshot.status).toBe('running');
    expect(snapshot.currentPhase?.name).toBe('Exhale');
    expect(snapshot.phaseRemainingSec).toBe(1);
  });

  it('pauses and resumes without drifting', () => {
    const state = start(createPacer(phases, 8), new Date('2024-01-01T00:00:00Z'));
    const paused = pause(state);
    const resumed = resume(paused, new Date('2024-01-01T00:00:05Z'));
    const ticked = tick(resumed, new Date('2024-01-01T00:00:06Z'));
    expect(ticked.elapsedSec).toBe(1);
  });

  it('completes at target duration', () => {
    const state = start(createPacer(phases, 4), new Date('2024-01-01T00:00:00Z'));
    const ticked = tick(state, new Date('2024-01-01T00:00:04Z'));
    const snapshot = getSnapshot(ticked);
    expect(snapshot.status).toBe('done');
    expect(snapshot.sessionRemainingSec).toBe(0);
  });
});
