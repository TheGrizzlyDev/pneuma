import { Exercise, RoutineTemplate } from './types';

export const seedExercises: Exercise[] = [
  {
    id: 'resonance-5-5',
    name: 'Resonance 5–5',
    goalCategory: 'bp',
    description: 'Gentle resonance breathing at an even 5-second inhale and exhale.',
    tags: ['resonance', 'steady'],
    defaultDurationSec: 300,
    phases: [
      { name: 'Inhale', seconds: 5, bubbleScale: 1.0, cue: 'in' },
      { name: 'Exhale', seconds: 5, bubbleScale: 0.7, cue: 'out' }
    ]
  },
  {
    id: 'diaphragmatic-4-6',
    name: 'Diaphragmatic 4–6',
    goalCategory: 'bp',
    description: 'Deep belly breaths with a longer exhale for calming the nervous system.',
    tags: ['diaphragm'],
    defaultDurationSec: 300,
    phases: [
      { name: 'Inhale', seconds: 4, bubbleScale: 1.0, cue: 'in' },
      { name: 'Exhale', seconds: 6, bubbleScale: 0.7, cue: 'out' }
    ]
  },
  {
    id: 'diaphragmatic-4-8',
    name: 'Diaphragmatic 4–8',
    goalCategory: 'bp',
    description: 'Longer exhale pattern to quickly settle heart rate.',
    tags: ['diaphragm'],
    defaultDurationSec: 240,
    phases: [
      { name: 'Inhale', seconds: 4, bubbleScale: 1.0, cue: 'in' },
      { name: 'Exhale', seconds: 8, bubbleScale: 0.7, cue: 'out' }
    ]
  },
  {
    id: 'box-4-4-4-4',
    name: 'Box 4–4–4–4',
    goalCategory: 'relax',
    description: 'Equal inhale, hold, exhale, and rest for a balanced reset.',
    tags: ['box'],
    defaultDurationSec: 180,
    phases: [
      { name: 'Inhale', seconds: 4, bubbleScale: 1.0, cue: 'in' },
      { name: 'Hold', seconds: 4, bubbleScale: 1.0, cue: 'hold' },
      { name: 'Exhale', seconds: 4, bubbleScale: 0.7, cue: 'out' },
      { name: 'Rest', seconds: 4, bubbleScale: 0.7, cue: 'rest' }
    ]
  },
  {
    id: 'four-seven-eight',
    name: '4–7–8',
    goalCategory: 'relax',
    description: 'A calming pattern for nervous system downshift.',
    tags: ['sleep', 'calm'],
    defaultDurationSec: 240,
    phases: [
      { name: 'Inhale', seconds: 4, bubbleScale: 1.0, cue: 'in' },
      { name: 'Hold', seconds: 7, bubbleScale: 1.0, cue: 'hold' },
      { name: 'Exhale', seconds: 8, bubbleScale: 0.7, cue: 'out' }
    ]
  },
  {
    id: 'focus-4-4-6',
    name: '4–4–6',
    goalCategory: 'focus',
    description: 'Sharper cadence to lift alertness and focus.',
    tags: ['focus'],
    defaultDurationSec: 180,
    phases: [
      { name: 'Inhale', seconds: 4, bubbleScale: 1.0, cue: 'in' },
      { name: 'Hold', seconds: 4, bubbleScale: 1.0, cue: 'hold' },
      { name: 'Exhale', seconds: 6, bubbleScale: 0.7, cue: 'out' }
    ]
  },
  {
    id: 'sleep-3-6',
    name: '3–6',
    goalCategory: 'sleep',
    description: 'Longer exhale cadence to ease into sleep.',
    tags: ['sleep'],
    defaultDurationSec: 300,
    phases: [
      { name: 'Inhale', seconds: 3, bubbleScale: 1.0, cue: 'in' },
      { name: 'Exhale', seconds: 6, bubbleScale: 0.7, cue: 'out' }
    ]
  },
  {
    id: 'physiological-sigh',
    name: 'Physiological Sigh',
    goalCategory: 'panic',
    description: 'Two-step inhale and long exhale to interrupt acute anxiety.',
    tags: ['panic', 'sigh'],
    defaultDurationSec: 90,
    phases: [
      { name: 'Inhale', seconds: 2, bubbleScale: 1.0, cue: 'in' },
      { name: 'Inhale', seconds: 1, bubbleScale: 1.0, cue: 'in' },
      { name: 'Exhale', seconds: 6, bubbleScale: 0.7, cue: 'out' },
      { name: 'Rest', seconds: 1, bubbleScale: 0.7, cue: 'rest' }
    ]
  }
];

export const seedTemplates: RoutineTemplate[] = [
  {
    id: 'template-quick-drop',
    name: '2-min BP Quick Drop',
    description: 'Short diaphragmatic reset for a fast blood pressure calm.',
    goalCategory: 'bp',
    items: [{ exerciseId: 'diaphragmatic-4-8', repeat: 1, durationOverrideSec: 120 }]
  },
  {
    id: 'template-bp-reset',
    name: '5-min Blood Pressure Reset',
    description: 'Resonance breathing to settle heart rate and tone.',
    goalCategory: 'bp',
    items: [{ exerciseId: 'resonance-5-5', repeat: 1, durationOverrideSec: 300 }]
  },
  {
    id: 'template-night-wind-down',
    name: 'Night Wind-down (8 min)',
    description: 'Transition from calming to sleep-focused cadence.',
    goalCategory: 'sleep',
    items: [
      { exerciseId: 'four-seven-eight', repeat: 1, durationOverrideSec: 240 },
      { exerciseId: 'sleep-3-6', repeat: 1, durationOverrideSec: 240 }
    ]
  },
  {
    id: 'template-calm-meeting',
    name: 'Calm Before Meeting (3 min)',
    description: 'Balanced box breathing to steady before a meeting.',
    goalCategory: 'relax',
    items: [{ exerciseId: 'box-4-4-4-4', repeat: 1, durationOverrideSec: 180 }]
  },
  {
    id: 'template-panic-interrupt',
    name: 'Panic Interrupt (90 sec)',
    description: 'Fast relief cycle for acute anxiety moments.',
    goalCategory: 'panic',
    items: [{ exerciseId: 'physiological-sigh', repeat: 1, durationOverrideSec: 90 }]
  }
];
