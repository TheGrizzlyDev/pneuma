import { describe, expect, it } from 'vitest';
import { buildPlayPlan, ScheduleError } from '../src/domain/schedule';
import { Exercise, Routine } from '../src/types';

const exercise: Exercise = {
  id: 'ex-1',
  name: 'Test',
  goalCategory: 'relax',
  description: 'desc',
  tags: [],
  defaultDurationSec: 60,
  phases: [{ name: 'Inhale', seconds: 4, bubbleScale: 1, cue: 'in' }]
};

describe('buildPlayPlan', () => {
  it('builds plan with repeats and rest', () => {
    const routine: Routine = {
      id: 'routine-1',
      name: 'Routine',
      description: 'desc',
      goalCategory: 'relax',
      items: [{ exerciseId: 'ex-1', repeat: 2, restBetweenRepeatsSec: 5 }]
    };

    const plan = buildPlayPlan(routine, [exercise]);
    expect(plan).toHaveLength(3);
    expect(plan[0]).toMatchObject({ type: 'exercise', durationSec: 60 });
    expect(plan[1]).toMatchObject({ type: 'rest', durationSec: 5 });
    expect(plan[2]).toMatchObject({ type: 'exercise', durationSec: 60 });
  });

  it('respects duration overrides', () => {
    const routine: Routine = {
      id: 'routine-2',
      name: 'Routine',
      description: 'desc',
      goalCategory: 'relax',
      items: [{ exerciseId: 'ex-1', repeat: 1, durationOverrideSec: 120 }]
    };

    const plan = buildPlayPlan(routine, [exercise]);
    expect(plan[0]).toMatchObject({ durationSec: 120 });
  });

  it('throws on missing exercise', () => {
    const routine: Routine = {
      id: 'routine-3',
      name: 'Routine',
      description: 'desc',
      goalCategory: 'relax',
      items: [{ exerciseId: 'missing', repeat: 1 }]
    };

    expect(() => buildPlayPlan(routine, [exercise])).toThrow(ScheduleError);
  });

  it('throws on invalid repeat', () => {
    const routine: Routine = {
      id: 'routine-4',
      name: 'Routine',
      description: 'desc',
      goalCategory: 'relax',
      items: [{ exerciseId: 'ex-1', repeat: 0 }]
    };

    expect(() => buildPlayPlan(routine, [exercise])).toThrow(ScheduleError);
  });
});
