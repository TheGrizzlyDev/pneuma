import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { buildPlayPlan, PlaySegment } from '../domain/schedule';
import { createPacer, getSnapshot, pause, resume, start, tick } from '../domain/pacer';
import { seedTemplates } from '../seed';
import { browserAudio } from '../platform/audio';
import { browserHaptics } from '../platform/haptics';
import { realClock } from '../platform/clock';
import { LogEntry, Routine } from '../types';
import { useStore } from '../ui/hooks/useStore';

interface RunnerState {
  status: 'idle' | 'running' | 'paused' | 'done';
  segmentIndex: number;
  segmentRemainingSec: number;
  pacerState?: ReturnType<typeof createPacer>;
  lastTickAt?: number;
}

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const buildRoutineFromTemplate = (templateId: string): Routine | undefined => {
  const template = seedTemplates.find((item) => item.id === templateId);
  if (!template) return undefined;
  return {
    id: template.id,
    name: template.name,
    description: template.description,
    goalCategory: template.goalCategory,
    items: template.items
  };
};

export const PlayerPage: React.FC = () => {
  const { store, update } = useStore();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const routineId = params.get('routineId');
  const exerciseId = params.get('exerciseId');
  const templateId = params.get('templateId');
  const routine = routineId
    ? store.routines.find((item) => item.id === routineId)
    : templateId
      ? buildRoutineFromTemplate(templateId)
      : undefined;

  const exercise = exerciseId ? store.exercises.find((item) => item.id === exerciseId) : undefined;

  const plan: PlaySegment[] = useMemo(() => {
    if (exercise) {
      return [
        {
          type: 'exercise',
          exerciseId: exercise.id,
          phases: exercise.phases,
          durationSec: exercise.defaultDurationSec
        }
      ];
    }
    if (routine) {
      return buildPlayPlan(routine, store.exercises);
    }
    return [];
  }, [exercise, routine, store.exercises]);

  const [runner, setRunner] = useState<RunnerState>(() => ({
    status: 'idle',
    segmentIndex: 0,
    segmentRemainingSec: plan[0]?.durationSec ?? 0
  }));

  const [soundEnabled, setSoundEnabled] = useState(store.settings.soundEnabled);
  const [vibrationEnabled, setVibrationEnabled] = useState(store.settings.vibrationEnabled);
  const [reducedMotion] = useState(store.settings.reducedMotion);
  const lastCueRef = useRef<string | null>(null);
  const loggedRef = useRef(false);

  const snapshot = runner.pacerState ? getSnapshot(runner.pacerState) : null;

  useEffect(() => {
    setRunner({ status: 'idle', segmentIndex: 0, segmentRemainingSec: plan[0]?.durationSec ?? 0 });
  }, [plan]);

  const startSegment = (index: number, now: Date): RunnerState => {
    const segment = plan[index];
    if (!segment) {
      return { status: 'done', segmentIndex: index, segmentRemainingSec: 0 };
    }
    if (segment.type === 'rest') {
      return {
        status: 'running',
        segmentIndex: index,
        segmentRemainingSec: segment.durationSec,
        lastTickAt: now.getTime()
      };
    }
    return {
      status: 'running',
      segmentIndex: index,
      segmentRemainingSec: segment.durationSec,
      pacerState: start(createPacer(segment.phases, segment.durationSec), now),
      lastTickAt: now.getTime()
    };
  };

  const startRunner = () => {
    const now = realClock.now();
    setRunner(startSegment(0, now));
    loggedRef.current = false;
  };

  const togglePause = () => {
    setRunner((prev) => {
      if (prev.status === 'running') {
        return { ...prev, status: 'paused', pacerState: prev.pacerState ? pause(prev.pacerState) : prev.pacerState, lastTickAt: undefined };
      }
      if (prev.status === 'paused') {
        const now = realClock.now();
        return {
          ...prev,
          status: 'running',
          pacerState: prev.pacerState ? resume(prev.pacerState, now) : prev.pacerState,
          lastTickAt: now.getTime()
        };
      }
      return prev;
    });
  };

  useEffect(() => {
    if (runner.status !== 'running') return;
    const interval = window.setInterval(() => {
      setRunner((prev) => {
        if (prev.status !== 'running' || !prev.lastTickAt) return prev;
        const now = realClock.now();
        const deltaSec = (now.getTime() - prev.lastTickAt) / 1000;
        if (deltaSec < 1) return prev;

        const segment = plan[prev.segmentIndex];
        if (!segment) return { ...prev, status: 'done', segmentRemainingSec: 0 };

        if (segment.type === 'rest') {
          const remaining = Math.max(prev.segmentRemainingSec - deltaSec, 0);
          if (remaining === 0) {
            return startSegment(prev.segmentIndex + 1, now);
          }
          return { ...prev, segmentRemainingSec: remaining, lastTickAt: now.getTime() };
        }

        const nextPacer = tick(prev.pacerState ?? createPacer(segment.phases, segment.durationSec), now);
        if (nextPacer.status === 'done') {
          return startSegment(prev.segmentIndex + 1, now);
        }
        return { ...prev, pacerState: nextPacer, segmentRemainingSec: nextPacer.targetDurationSec - nextPacer.elapsedSec, lastTickAt: now.getTime() };
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [runner.status, plan]);

  useEffect(() => {
    if (!snapshot?.currentPhase) return;
    const cue = snapshot.currentPhase.cue;
    if (cue === lastCueRef.current) return;
    lastCueRef.current = cue;
    if (soundEnabled) browserAudio.playCue(cue);
    if (vibrationEnabled && browserHaptics.isSupported) browserHaptics.vibrate(80);
  }, [snapshot?.currentPhase?.cue, soundEnabled, vibrationEnabled]);

  useEffect(() => {
    if (runner.status !== 'done' || loggedRef.current) return;
    loggedRef.current = true;
    const durationSec = plan.reduce((sum, segment) => sum + segment.durationSec, 0);
    const log: LogEntry = {
      id: `log-${crypto.randomUUID()}`,
      routineId: routine?.id ?? exercise?.id ?? 'exercise',
      startedAt: new Date(Date.now() - durationSec * 1000).toISOString(),
      completedAt: new Date().toISOString(),
      durationSec
    };
    update((current) => ({ ...current, logs: [log, ...current.logs] }));
  }, [runner.status, plan, routine, exercise, update]);

  if (!plan.length) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <h2 className="text-xl font-bold mb-2">No exercise selected</h2>
            <button
                onClick={() => navigate('/exercises')}
                className="bg-primary text-[#112217] px-6 py-2 rounded-xl font-bold"
            >
                Go to Exercises
            </button>
        </div>
    );
  }

  const phaseName = snapshot?.currentPhase?.name ?? (runner.status === 'idle' ? 'Ready' : runner.status === 'done' ? 'Done' : 'Rest');
  const phaseRemaining = Math.ceil(snapshot?.phaseRemainingSec ?? runner.segmentRemainingSec);
  const sessionRemaining = Math.ceil(snapshot?.sessionRemainingSec ?? runner.segmentRemainingSec);
  const bubbleScale = snapshot?.currentPhase?.bubbleScale ?? 0.8;

  return (
    <div className="flex-1 flex flex-col h-full w-full max-w-[960px] mx-auto overflow-hidden">
        {/* Top Header inside page */}
        <div className="flex items-center justify-between px-6 py-5 w-full z-10">
            <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl">spa</span>
                <h2 className="text-xl font-bold leading-tight tracking-[-0.015em]">{routine?.name ?? exercise?.name ?? 'Breathing Pacer'}</h2>
            </div>
            <button
                onClick={() => navigate('/settings')}
                className="flex cursor-pointer items-center justify-center rounded-xl h-10 w-10 bg-transparent hover:bg-black/5 dark:hover:bg-white/10 text-[#111418] dark:text-white transition-colors"
            >
                <span className="material-symbols-outlined text-2xl">settings</span>
            </button>
        </div>

        {/* Main Breathing Area */}
        <main className="flex-1 flex flex-col items-center justify-center relative w-full px-4">
            <div className="relative flex items-center justify-center">
                {/* Glow effect */}
                <div
                    className="absolute inset-0 rounded-full bg-sage-light/50 dark:bg-sage-dark/30 blur-3xl transform transition-all duration-1000 ease-in-out"
                    style={{ transform: reducedMotion ? 'scale(1.1)' : `scale(${1.1 + (bubbleScale - 0.7) * 0.5})` }}
                ></div>

                {/* Main Circle */}
                <div
                    className="relative flex flex-col items-center justify-center rounded-full bg-sage-light dark:bg-sage-dark shadow-sm transition-all duration-1000 ease-in-out"
                    style={{
                        width: 'min(70vw, 420px)',
                        height: 'min(70vw, 420px)',
                        transform: reducedMotion ? 'none' : `scale(${bubbleScale})`
                    }}
                >
                    <div className="flex flex-col items-center justify-center text-center z-10 gap-2">
                        <h1 className="text-[#1e3a29] dark:text-white text-[40px] md:text-[48px] font-bold leading-tight tracking-tight">
                            {phaseName}
                        </h1>
                        <p className="text-[#1e3a29]/80 dark:text-white/80 text-[64px] md:text-[80px] font-bold leading-none tracking-tight mt-2">
                            {phaseRemaining}
                        </p>
                    </div>
                </div>
            </div>
        </main>

        {/* Bottom Controls */}
        <footer className="flex flex-col items-center justify-end w-full pb-10 px-6 gap-8 z-10">
            {/* Timer Display */}
            <div className="flex flex-col items-center gap-2">
                <p className="text-[#111418]/60 dark:text-white/60 text-sm font-medium tracking-wide uppercase">Total session time remaining</p>
                <div className="text-[#111418] dark:text-white text-3xl font-bold tracking-tight tabular-nums">
                    {formatTime(sessionRemaining)}
                </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-center gap-10 w-full max-w-md">
                {/* Sound Toggle */}
                <button
                    onClick={() => {
                        const next = !soundEnabled;
                        setSoundEnabled(next);
                        update(s => ({...s, settings: {...s.settings, soundEnabled: next}}));
                    }}
                    aria-label="Toggle Sound"
                    className="group flex items-center justify-center w-14 h-14 rounded-full bg-white dark:bg-[#1e2f23] text-[#111418] dark:text-white shadow-sm hover:shadow-md transition-all active:scale-95 border border-gray-100 dark:border-transparent"
                >
                    <span className={`material-symbols-outlined transition-colors ${soundEnabled ? 'text-primary' : 'text-gray-400'}`} style={{fontSize: '24px'}}>
                        {soundEnabled ? 'volume_up' : 'volume_off'}
                    </span>
                </button>

                {/* Play/Pause/Start */}
                <button
                    onClick={runner.status === 'idle' || runner.status === 'done' ? startRunner : togglePause}
                    aria-label={runner.status === 'running' ? "Pause Session" : "Start Session"}
                    className="flex items-center justify-center w-20 h-20 rounded-full bg-primary text-[#112116] shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-105 active:scale-95 transition-all duration-300"
                >
                    <span className="material-symbols-outlined" style={{fontSize: '40px', fontVariationSettings: "'FILL' 1"}}>
                        {runner.status === 'running' ? 'pause' : 'play_arrow'}
                    </span>
                </button>

                {/* Vibration Toggle */}
                <button
                    onClick={() => {
                        const next = !vibrationEnabled;
                        setVibrationEnabled(next);
                        update(s => ({...s, settings: {...s.settings, vibrationEnabled: next}}));
                    }}
                    aria-label="Toggle Vibration"
                    className="group flex items-center justify-center w-14 h-14 rounded-full bg-white dark:bg-[#1e2f23] text-[#111418] dark:text-white shadow-sm hover:shadow-md transition-all active:scale-95 border border-gray-100 dark:border-transparent"
                >
                    <span className={`material-symbols-outlined transition-colors ${vibrationEnabled ? 'text-primary' : 'text-gray-400'}`} style={{fontSize: '24px'}}>
                        {vibrationEnabled ? 'vibration' : 'vibration'}
                    </span>
                </button>
            </div>
        </footer>
    </div>
  );
};
