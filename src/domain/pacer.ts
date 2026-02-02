import { Phase } from '../types';

export type PacerStatus = 'idle' | 'running' | 'paused' | 'done';

export interface PacerState {
  status: PacerStatus;
  phases: Phase[];
  targetDurationSec: number;
  elapsedSec: number;
  lastTickAt?: number;
}

export interface PacerSnapshot {
  status: PacerStatus;
  currentPhase: Phase | null;
  phaseRemainingSec: number;
  sessionRemainingSec: number;
}

export const createPacer = (phases: Phase[], targetDurationSec: number): PacerState => ({
  status: 'idle',
  phases,
  targetDurationSec,
  elapsedSec: 0
});

const clampElapsed = (elapsed: number, targetDurationSec: number) =>
  Math.min(Math.max(elapsed, 0), targetDurationSec);

const totalPhaseDuration = (phases: Phase[]) =>
  phases.reduce((total, phase) => total + phase.seconds, 0);

export const getPhaseAt = (phases: Phase[], elapsedSec: number) => {
  const cycle = totalPhaseDuration(phases);
  if (cycle <= 0) {
    return { phase: null as Phase | null, remaining: 0 };
  }

  const withinCycle = elapsedSec % cycle;
  let cursor = 0;
  for (const phase of phases) {
    const end = cursor + phase.seconds;
    if (withinCycle < end) {
      return { phase, remaining: end - withinCycle };
    }
    cursor = end;
  }
  return { phase: phases[phases.length - 1], remaining: 0 };
};

export const getSnapshot = (state: PacerState): PacerSnapshot => {
  if (state.status === 'idle') {
    return { status: 'idle', currentPhase: state.phases[0] ?? null, phaseRemainingSec: 0, sessionRemainingSec: state.targetDurationSec };
  }
  if (state.status === 'done') {
    return { status: 'done', currentPhase: null, phaseRemainingSec: 0, sessionRemainingSec: 0 };
  }

  const elapsed = clampElapsed(state.elapsedSec, state.targetDurationSec);
  const { phase, remaining } = getPhaseAt(state.phases, elapsed);
  return {
    status: state.status,
    currentPhase: phase,
    phaseRemainingSec: remaining,
    sessionRemainingSec: Math.max(state.targetDurationSec - elapsed, 0)
  };
};

export const start = (state: PacerState, now: Date): PacerState => ({
  ...state,
  status: 'running',
  elapsedSec: 0,
  lastTickAt: now.getTime()
});

export const tick = (state: PacerState, now: Date): PacerState => {
  if (state.status !== 'running' || state.lastTickAt === undefined) return state;
  const deltaSec = Math.max(0, Math.floor((now.getTime() - state.lastTickAt) / 1000));
  if (deltaSec === 0) return state;

  const nextElapsed = clampElapsed(state.elapsedSec + deltaSec, state.targetDurationSec);
  const done = nextElapsed >= state.targetDurationSec;
  return {
    ...state,
    elapsedSec: nextElapsed,
    status: done ? 'done' : 'running',
    lastTickAt: now.getTime()
  };
};

export const pause = (state: PacerState): PacerState => {
  if (state.status !== 'running') return state;
  return { ...state, status: 'paused', lastTickAt: undefined };
};

export const resume = (state: PacerState, now: Date): PacerState => {
  if (state.status !== 'paused') return state;
  return { ...state, status: 'running', lastTickAt: now.getTime() };
};

export const stop = (state: PacerState): PacerState => ({
  ...state,
  status: 'idle',
  elapsedSec: 0,
  lastTickAt: undefined
});

export const reset = (state: PacerState): PacerState => ({
  ...state,
  status: 'idle',
  elapsedSec: 0,
  lastTickAt: undefined
});
