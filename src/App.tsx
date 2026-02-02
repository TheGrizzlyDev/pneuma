import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { TopNav } from './ui/components/TopNav';
import { DueBanner } from './ui/components/DueBanner';
import { useStore } from './ui/hooks/useStore';
import { acknowledgeReminder, getDueReminders, snoozeReminder } from './domain/reminders';
import { browserNotifications } from './platform/notifications';
import { realClock } from './platform/clock';
import { HomePage } from './pages/HomePage';
import { ExercisesPage } from './pages/ExercisesPage';
import { ExerciseDetailPage } from './pages/ExerciseDetailPage';
import { RoutinesPage } from './pages/RoutinesPage';
import { RoutineDetailPage } from './pages/RoutineDetailPage';
import { RoutineEditPage } from './pages/RoutineEditPage';
import { RemindersPage } from './pages/RemindersPage';
import { PlayerPage } from './pages/PlayerPage';
import { LogsPage } from './pages/LogsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AboutPage } from './pages/AboutPage';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="app">
    <header className="app-header">
      <h1>Breathing Companion</h1>
      <p className="subtitle">Offline-first breathing routines for calm, focus, and sleep.</p>
    </header>
    <TopNav />
    <main className="app-main">{children}</main>
  </div>
);

const AppShell: React.FC = () => {
  const { store, update } = useStore();
  const [dueReminderId, setDueReminderId] = useState<string | null>(null);
  const navigate = useNavigate();

  const dueReminder = useMemo(
    () => store.reminders.find((reminder) => reminder.id === dueReminderId),
    [store.reminders, dueReminderId]
  );

  const dueRoutine = useMemo(
    () => store.routines.find((routine) => routine.id === dueReminder?.routineId),
    [store.routines, dueReminder]
  );

  const runDueCheck = () => {
    const now = realClock.now();
    const due = getDueReminders(store.reminders, now);
    if (!due.length) {
      setDueReminderId(null);
      return;
    }
    const nextReminder = due[0];
    setDueReminderId(nextReminder.id);

    if (browserNotifications.permission === 'granted') {
      browserNotifications.send('Breathing routine due', {
        body: `Time for ${store.routines.find((routine) => routine.id === nextReminder.routineId)?.name ?? 'your routine'}.`
      });
    }
  };

  useEffect(() => {
    runDueCheck();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') runDueCheck();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [store.reminders]);

  const handleDismiss = () => {
    if (!dueReminder) return;
    update((current) => ({
      ...current,
      reminders: current.reminders.map((reminder) =>
        reminder.id === dueReminder.id ? acknowledgeReminder(reminder, realClock.now()) : reminder
      )
    }));
    setDueReminderId(null);
  };

  const handleSnooze = () => {
    if (!dueReminder) return;
    update((current) => ({
      ...current,
      reminders: current.reminders.map((reminder) =>
        reminder.id === dueReminder.id ? snoozeReminder(reminder, realClock.now(), 10) : reminder
      )
    }));
    setDueReminderId(null);
  };

  return (
    <AppLayout>
      {dueReminder && (
        <DueBanner
          reminder={dueReminder}
          routine={dueRoutine}
          onStart={() => {
            update((current) => ({
              ...current,
              reminders: current.reminders.map((reminder) =>
                reminder.id === dueReminder.id ? acknowledgeReminder(reminder, realClock.now()) : reminder
              )
            }));
            setDueReminderId(null);
            navigate(`/player?routineId=${dueReminder.routineId}`);
          }}
          onSnooze={handleSnooze}
          onDismiss={handleDismiss}
        />
      )}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/exercises" element={<ExercisesPage />} />
        <Route path="/exercises/:id" element={<ExerciseDetailPage />} />
        <Route path="/routines" element={<RoutinesPage />} />
        <Route path="/routines/:id" element={<RoutineDetailPage />} />
        <Route path="/routines/:id/edit" element={<RoutineEditPage />} />
        <Route path="/reminders" element={<RemindersPage />} />
        <Route path="/player" element={<PlayerPage />} />
        <Route path="/logs" element={<LogsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </AppLayout>
  );
};

export const App: React.FC = () => (
  <BrowserRouter>
    <AppShell />
  </BrowserRouter>
);
