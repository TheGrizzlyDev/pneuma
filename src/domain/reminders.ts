import { Reminder } from '../types';

export const parseTimeOfDay = (timeOfDay: string) => {
  const [hours, minutes] = timeOfDay.split(':').map((value) => Number(value));
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    throw new Error('Invalid timeOfDay format');
  }
  return { hours, minutes };
};

export const setTimeOnDate = (date: Date, timeOfDay: string) => {
  const { hours, minutes } = parseTimeOfDay(timeOfDay);
  const next = new Date(date);
  next.setHours(hours, minutes, 0, 0);
  return next;
};

export const computeNextOccurrence = (
  reminder: Pick<Reminder, 'timeOfDay' | 'weekdays' | 'snoozedUntil'>,
  now: Date
): Date => {
  if (reminder.snoozedUntil) {
    const snoozed = new Date(reminder.snoozedUntil);
    if (snoozed > now) return snoozed;
  }

  const weekdays = reminder.weekdays?.length ? reminder.weekdays : undefined;

  for (let offset = 0; offset <= 7; offset += 1) {
    const candidate = new Date(now);
    candidate.setDate(candidate.getDate() + offset);
    const timedCandidate = setTimeOnDate(candidate, reminder.timeOfDay);
    const weekday = timedCandidate.getDay();
    if (weekdays && !weekdays.includes(weekday)) continue;
    if (timedCandidate <= now) continue;
    return timedCandidate;
  }

  const fallback = setTimeOnDate(new Date(now), reminder.timeOfDay);
  fallback.setDate(fallback.getDate() + 7);
  return fallback;
};

export const computeMostRecentOccurrence = (
  reminder: Pick<Reminder, 'timeOfDay' | 'weekdays'>,
  now: Date
): Date => {
  const weekdays = reminder.weekdays?.length ? reminder.weekdays : undefined;
  const base = setTimeOnDate(now, reminder.timeOfDay);

  for (let offset = 0; offset <= 7; offset += 1) {
    const candidate = new Date(base);
    candidate.setDate(candidate.getDate() - offset);
    const weekday = candidate.getDay();
    if (weekdays && !weekdays.includes(weekday)) continue;
    if (candidate <= now) return candidate;
  }

  const fallback = new Date(base);
  fallback.setDate(fallback.getDate() - 7);
  return fallback;
};

export const isDue = (reminder: Reminder, now: Date) => {
  if (!reminder.enabled) return false;
  if (reminder.snoozedUntil) {
    const snoozed = new Date(reminder.snoozedUntil);
    if (snoozed > now) return false;
    const lastFiredAt = reminder.lastFiredAt ? new Date(reminder.lastFiredAt) : undefined;
    return !lastFiredAt || lastFiredAt < snoozed;
  }
  const scheduled = computeMostRecentOccurrence(reminder, now);
  const lastFiredAt = reminder.lastFiredAt ? new Date(reminder.lastFiredAt) : undefined;
  if (lastFiredAt && lastFiredAt >= scheduled) return false;
  return now >= scheduled;
};

export const getDueReminders = (reminders: Reminder[], now: Date) =>
  reminders.filter((reminder) => isDue(reminder, now));

export const acknowledgeReminder = (reminder: Reminder, now: Date): Reminder => ({
  ...reminder,
  lastFiredAt: now.toISOString(),
  snoozedUntil: undefined
});

export const snoozeReminder = (reminder: Reminder, now: Date, minutes: number): Reminder => {
  const snoozedUntil = new Date(now.getTime() + minutes * 60 * 1000);
  return { ...reminder, snoozedUntil: snoozedUntil.toISOString() };
};
