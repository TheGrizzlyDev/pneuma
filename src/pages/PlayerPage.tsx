import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { buildPlayPlan, PlaySegment } from '../domain/schedule';
import { createPacer, getSnapshot, pause, resume, start, tick } from '../domain/pacer';
import { seedTemplates } from '../seed';
import { browserAudio } from '../platform/audio';
import { browserHaptics } from '../platform/haptics';
import { realClock } from '../platform/clock';
import { LogEntry, Routine } from '../types';
import { useStore } from '../ui/hooks/useStore';
import { Card } from '../ui/components/Card';
import { Button } from '../ui/components/Button';

interface RunnerState {
  status: 'idle' | 'running' | 'paused' | 'done';
  segmentIndex: number;
  segmentRemainingSec: number;
  pacerState?: ReturnType<typeof createPacer>;
  lastTickAt?: number;
}

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
  const [reducedMotion, setReducedMotion] = useState(store.settings.reducedMotion);
  const lastCueRef = useRef<string | null>(null);
  const loggedRef = useRef(false);

  const currentSegment = plan[runner.segmentIndex];
  const snapshot = runner.pacerState ? getSnapshot(runner.pacerState) : null;

  useEffect(() => {
    setRunner({ status: 'idle', segmentIndex: 0, segmentRemainingSec: plan[0]?.durationSec ?? 0 });
  }, [plan]);

  const startSegment = (index: number, now: Date): RunnerState => {
    const segment = plan[index];
    if (!segment) {
      return { ...runner, status: 'done', segmentRemainingSec: 0 };
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

  const stopRunner = () => {
    setRunner({ status: 'idle', segmentIndex: 0, segmentRemainingSec: plan[0]?.durationSec ?? 0 });
  };

  useEffect(() => {
    if (runner.status !== 'running') return;
    const interval = window.setInterval(() => {
      setRunner((prev) => {
        if (prev.status !== 'running' || !prev.lastTickAt) return prev;
        const now = realClock.now();
        const deltaSec = Math.floor((now.getTime() - prev.lastTickAt) / 1000);
        if (deltaSec <= 0) return prev;

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
    return <Card>Select a routine or exercise to start.</Card>;
  }

  return (
    <div className="list">
      <Card>
        <h2>Player</h2>
        <p>{routine?.name ?? exercise?.name ?? 'Session'}</p>
        <p>
          Segment {runner.segmentIndex + 1} of {plan.length} ({currentSegment?.type ?? 'exercise'})
        </p>
      </Card>
      <Card>
        <div className="pacer">
          <div className="pacer-circle" style={{ transform: reducedMotion ? 'none' : undefined }}>
            {snapshot?.currentPhase?.name ?? (currentSegment?.type === 'rest' ? 'Rest' : 'Ready')}
          </div>
          <p>Phase remaining: {snapshot?.phaseRemainingSec ?? runner.segmentRemainingSec}s</p>
          <p>Session remaining: {snapshot?.sessionRemainingSec ?? runner.segmentRemainingSec}s</p>
        </div>
        <div className="pacer-controls">
          {runner.status === 'idle' ? <Button onClick={startRunner}>Start</Button> : null}
          {runner.status === 'running' || runner.status === 'paused' ? (
            <Button variant="secondary" onClick={togglePause}>
              {runner.status === 'running' ? 'Pause' : 'Resume'}
            </Button>
          ) : null}
          <Button variant="ghost" onClick={stopRunner}>
            Stop
          </Button>
        </div>
      </Card>
      <Card>
        <h3>Options</h3>
        <div className="form-grid">
          <label>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(event) => {
                setSoundEnabled(event.target.checked);
                update((current) => ({
                  ...current,
                  settings: { ...current.settings, soundEnabled: event.target.checked }
                }));
              }}
            />{' '}
            Sound cues
          </label>
          <label>
            <input
              type="checkbox"
              checked={vibrationEnabled}
              onChange={(event) => {
                setVibrationEnabled(event.target.checked);
                update((current) => ({
                  ...current,
                  settings: { ...current.settings, vibrationEnabled: event.target.checked }
                }));
              }}
            />
            Vibration cues
          </label>
          <label>
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(event) => {
                setReducedMotion(event.target.checked);
                update((current) => ({
                  ...current,
                  settings: { ...current.settings, reducedMotion: event.target.checked }
                }));
              }}
            />
            Reduced motion
          </label>
        </div>
      </Card>
    </div>
  );
};
