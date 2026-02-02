import React, { useState } from 'react';
import { computeNextOccurrence } from '../domain/reminders';
import { browserNotifications } from '../platform/notifications';
import { Reminder } from '../types';
import { useStore } from '../ui/hooks/useStore';
import { Button } from '../ui/components/Button';
import { Card } from '../ui/components/Card';

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const RemindersPage: React.FC = () => {
  const { store, update } = useStore();
  const [routineId, setRoutineId] = useState(store.routines[0]?.id ?? '');
  const [timeOfDay, setTimeOfDay] = useState('08:00');
  const [weekdays, setWeekdays] = useState<number[]>([]);

  const createReminder = () => {
    if (!routineId) return;
    const reminder: Reminder = {
      id: `reminder-${crypto.randomUUID()}`,
      routineId,
      enabled: true,
      timeOfDay,
      weekdays: weekdays.length ? weekdays : undefined,
      createdAt: new Date().toISOString()
    };
    update((current) => ({ ...current, reminders: [...current.reminders, reminder] }));
  };

  const toggleWeekday = (day: number) => {
    setWeekdays((current) =>
      current.includes(day) ? current.filter((item) => item !== day) : [...current, day]
    );
  };

  const toggleReminder = (id: string) => {
    update((current) => ({
      ...current,
      reminders: current.reminders.map((reminder) =>
        reminder.id === id ? { ...reminder, enabled: !reminder.enabled } : reminder
      )
    }));
  };

  return (
    <div className="list">
      <Card>
        <h2>Reminders</h2>
        <p>In-app banners are the reliable reminder method. Background notifications are limited on iOS Safari.</p>
        <Button
          variant="secondary"
          onClick={() => {
            browserNotifications.requestPermission();
          }}
        >
          Request notification permission
        </Button>
        <Button
          variant="ghost"
          onClick={() => browserNotifications.send('Breathing test', { body: 'This is a test notification while the app is open.' })}
        >
          Test notification
        </Button>
      </Card>
      <Card>
        <h3>Create reminder</h3>
        {store.routines.length === 0 ? <p>Create a routine first.</p> : null}
        <div className="form-grid">
          <label>
            Routine
            <select value={routineId} onChange={(event) => setRoutineId(event.target.value)}>
              {store.routines.map((routine) => (
                <option key={routine.id} value={routine.id}>
                  {routine.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Time of day
            <input type="time" value={timeOfDay} onChange={(event) => setTimeOfDay(event.target.value)} />
          </label>
          <label>
            Weekdays (optional)
            <div className="segmented">
              {weekdayLabels.map((label, index) => (
                <button
                  key={label}
                  type="button"
                  className={`segmented-btn ${weekdays.includes(index) ? 'active' : ''}`}
                  onClick={() => toggleWeekday(index)}
                >
                  {label}
                </button>
              ))}
            </div>
          </label>
          <Button onClick={createReminder}>Save reminder</Button>
        </div>
      </Card>
      {store.reminders.map((reminder) => (
        <Card key={reminder.id}>
          <h3>{store.routines.find((routine) => routine.id === reminder.routineId)?.name ?? 'Routine'}</h3>
          <p>
            {reminder.timeOfDay} — Next: {computeNextOccurrence(reminder, new Date()).toLocaleString()}
          </p>
          <Button variant="secondary" onClick={() => toggleReminder(reminder.id)}>
            {reminder.enabled ? 'Disable' : 'Enable'}
          </Button>
        </Card>
      ))}
    </div>
  );
};
