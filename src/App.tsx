import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Route, Routes, useNavigate, NavLink } from 'react-router-dom';
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
import { DueBanner } from './ui/components/DueBanner';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-[#112116] dark:text-white">
      <header className="w-full border-b border-gray-200 dark:border-[#244730] bg-white dark:bg-[#112217] px-4 md:px-10 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between whitespace-nowrap max-w-[960px] mx-auto">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
            <div className="size-8 text-primary">
              <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" fill="currentColor"></path>
              </svg>
            </div>
            <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">Breathing App</h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <nav className="hidden md:flex items-center gap-9">
              <NavLink to="/" className={({ isActive }) => `text-sm font-medium leading-normal hover:text-primary transition-colors ${isActive ? '' : 'opacity-70'}`}>Home</NavLink>
              <NavLink to="/exercises" className={({ isActive }) => `text-sm font-medium leading-normal hover:text-primary transition-colors ${isActive ? '' : 'opacity-70'}`}>Exercises</NavLink>
              <NavLink to="/routines" className={({ isActive }) => `text-sm font-medium leading-normal hover:text-primary transition-colors ${isActive ? '' : 'opacity-70'}`}>Routines</NavLink>
              <NavLink to="/reminders" className={({ isActive }) => `text-sm font-medium leading-normal hover:text-primary transition-colors ${isActive ? '' : 'opacity-70'}`}>Reminders</NavLink>
              <NavLink to="/logs" className={({ isActive }) => `text-sm font-medium leading-normal hover:text-primary transition-colors ${isActive ? '' : 'opacity-70'}`}>Logs</NavLink>
            </nav>
            <button
              onClick={() => navigate('/settings')}
              className="flex min-w-[40px] h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-gray-200 dark:bg-[#244730] text-[#112116] dark:text-white transition-colors hover:bg-primary hover:text-[#112217]"
            >
              <span className="material-symbols-outlined">person</span>
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 flex justify-center py-5 px-4 md:px-10">
        <div className="layout-content-container flex flex-col max-w-[960px] flex-1 gap-6">
          {children}
        </div>
      </main>
    </div>
  );
};

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
