export type GoalCategory = 'bp' | 'relax' | 'focus' | 'sleep' | 'panic';

export type PhaseName = 'Inhale' | 'Hold' | 'Exhale' | 'Rest';
export type PhaseCue = 'in' | 'hold' | 'out' | 'rest';

export interface Phase {
  name: PhaseName;
  seconds: number;
  bubbleScale: number;
  cue: PhaseCue;
}

export interface Exercise {
  id: string;
  name: string;
  goalCategory: GoalCategory;
  description: string;
  tags: string[];
  defaultDurationSec: number;
  phases: Phase[];
}

export interface RoutineItem {
  exerciseId: string;
  repeat: number;
  durationOverrideSec?: number;
  restBetweenRepeatsSec?: number;
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  goalCategory: GoalCategory;
  items: RoutineItem[];
}

export interface Reminder {
  id: string;
  routineId: string;
  enabled: boolean;
  timeOfDay: string; // HH:MM
  weekdays?: number[]; // 0-6 (Sun-Sat)
  lastFiredAt?: string;
  snoozedUntil?: string;
  createdAt: string;
}

export interface LogEntry {
  id: string;
  routineId: string;
  startedAt: string;
  completedAt: string;
  durationSec: number;
  bpSys?: number;
  bpDia?: number;
  notes?: string;
  breakdown?: string;
}

export interface Settings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  reducedMotion: boolean;
}

export interface StoreData {
  version: number;
  exercises: Exercise[];
  routines: Routine[];
  reminders: Reminder[];
  logs: LogEntry[];
  settings: Settings;
}

export interface RoutineTemplate {
  id: string;
  name: string;
  description: string;
  goalCategory: GoalCategory;
  items: RoutineItem[];
}
