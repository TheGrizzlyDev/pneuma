import { Exercise, Routine, RoutineItem } from '../types';

// TDD workflow: tests for schedule planning live in tests/schedule.test.ts (Red-Green-Refactor).
// Architecture note: domain logic stays pure and is consumed by UI via small interfaces.

export type PlaySegment =
  | {
      type: 'exercise';
      exerciseId: string;
      phases: Exercise['phases'];
      durationSec: number;
    }
  | {
      type: 'rest';
      durationSec: number;
    };

export class ScheduleError extends Error {}

const validateItem = (item: RoutineItem) => {
  if (item.repeat <= 0) {
    throw new ScheduleError('Repeat count must be at least 1.');
  }
};

export const buildPlayPlan = (routine: Routine, exercises: Exercise[]): PlaySegment[] => {
  const exerciseMap = new Map(exercises.map((exercise) => [exercise.id, exercise]));
  const plan: PlaySegment[] = [];

  routine.items.forEach((item) => {
    validateItem(item);
    const exercise = exerciseMap.get(item.exerciseId);
    if (!exercise) {
      throw new ScheduleError(`Missing exercise: ${item.exerciseId}`);
    }

    for (let index = 0; index < item.repeat; index += 1) {
      plan.push({
        type: 'exercise',
        exerciseId: exercise.id,
        phases: exercise.phases,
        durationSec: item.durationOverrideSec ?? exercise.defaultDurationSec
      });
      if (item.restBetweenRepeatsSec && index < item.repeat - 1) {
        plan.push({ type: 'rest', durationSec: item.restBetweenRepeatsSec });
      }
    }
  });

  return plan;
};
