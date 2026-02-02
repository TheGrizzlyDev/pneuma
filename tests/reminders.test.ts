import { describe, expect, it } from 'vitest';
import { computeNextOccurrence, getDueReminders } from '../src/domain/reminders';
import { Reminder } from '../src/types';

describe('reminders', () => {
  it('computes next occurrence on same day', () => {
    const reminder: Reminder = {
      id: 'rem-1',
      routineId: 'routine',
      enabled: true,
      timeOfDay: '15:30',
      createdAt: new Date().toISOString()
    };
    const now = new Date('2024-01-01T10:00:00');
    const next = computeNextOccurrence(reminder, now);
    expect(next.getHours()).toBe(15);
    expect(next.getMinutes()).toBe(30);
  });

  it('skips to next weekday', () => {
    const reminder: Reminder = {
      id: 'rem-2',
      routineId: 'routine',
      enabled: true,
      timeOfDay: '08:00',
      weekdays: [1],
      createdAt: new Date().toISOString()
    };
    const now = new Date('2024-01-07T09:00:00'); // Sunday
    const next = computeNextOccurrence(reminder, now);
    expect(next.getDay()).toBe(1);
  });

  it('returns due reminders when past time and not fired', () => {
    const reminder: Reminder = {
      id: 'rem-3',
      routineId: 'routine',
      enabled: true,
      timeOfDay: '08:00',
      createdAt: new Date().toISOString()
    };
    const now = new Date('2024-01-01T08:01:00');
    const due = getDueReminders([reminder], now);
    expect(due).toHaveLength(1);
  });
});
