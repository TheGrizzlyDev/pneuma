import React from 'react';
import { computeNextOccurrence } from '../domain/reminders';
import { browserNotifications } from '../platform/notifications';
import { useStore } from '../ui/hooks/useStore';

export const RemindersPage: React.FC = () => {
  const { store, update } = useStore();

  const nextReminder = store.reminders
    .filter((reminder) => reminder.enabled)
    .map((reminder) => ({
      reminder,
      next: computeNextOccurrence(reminder, new Date())
    }))
    .sort((a, b) => a.next.getTime() - b.next.getTime())[0];

  const toggleReminder = (id: string) => {
    update((current) => ({
      ...current,
      reminders: current.reminders.map((reminder) =>
        reminder.id === id ? { ...reminder, enabled: !reminder.enabled } : reminder
      )
    }));
  };

  const getIconForTime = (time: string) => {
      const hour = parseInt(time.split(':')[0]);
      if (hour >= 5 && hour < 12) return 'wb_sunny';
      if (hour >= 12 && hour < 17) return 'coffee';
      if (hour >= 17 && hour < 21) return 'wb_twilight';
      return 'bedtime';
  };

  const formatTimeAMPM = (time: string) => {
      const [hour, minute] = time.split(':');
      const h = parseInt(hour);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${h12.toString().padStart(2, '0')}:${minute} ${ampm}`;
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Page Heading */}
      <div className="flex flex-col gap-3 p-4">
        <h1 className="text-4xl font-black leading-tight tracking-[-0.033em]">Daily Reminders</h1>
        <p className="text-[#4b6354] dark:text-[#93c8a5] text-base font-normal leading-normal">Manage your daily breathing practice schedule.</p>
      </div>

      {/* Stats: Next Scheduled */}
      <div className="p-4 pt-0">
        <div className="flex flex-col gap-2 rounded-xl p-6 bg-[#244730] bg-opacity-10 dark:bg-[#244730] shadow-sm border border-gray-200 dark:border-transparent">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>schedule</span>
            <p className="text-[#112116] dark:text-white text-sm font-medium uppercase tracking-wider">Next Scheduled</p>
          </div>
          <p className="text-[#112116] dark:text-white tracking-light text-3xl font-bold leading-tight">
            {nextReminder ? nextReminder.next.toLocaleString([], { weekday: 'long', hour: '2-digit', minute: '2-digit' }) : 'None scheduled'}
          </p>
        </div>
      </div>

      {/* Reminder List */}
      <div className="flex flex-col gap-2 p-4">
        <h2 className="text-lg font-bold mb-2 px-2">Your Schedule</h2>
        {store.reminders.length === 0 && (
            <p className="px-2 text-gray-500">No reminders set. Click below to add one.</p>
        )}
        {store.reminders.map((reminder) => (
          <div key={reminder.id} className="flex items-center gap-4 bg-white dark:bg-[#112116] p-4 rounded-xl border border-gray-200 dark:border-[#244730] transition-all hover:bg-gray-50 dark:hover:bg-[#244730]/50">
            <div className="flex items-center gap-4 flex-1">
              <div className="text-white flex items-center justify-center rounded-lg bg-[#244730] shrink-0 size-12 shadow-sm">
                <span className="material-symbols-outlined">{getIconForTime(reminder.timeOfDay)}</span>
              </div>
              <div className="flex flex-col">
                <p className="text-[#112116] dark:text-white text-base font-semibold leading-normal">
                    {store.routines.find(r => r.id === reminder.routineId)?.name ?? 'Breathing Practice'}
                </p>
                <p className="text-[#4b6354] dark:text-[#93c8a5] text-sm">{formatTimeAMPM(reminder.timeOfDay)}</p>
              </div>
            </div>
            <div className="shrink-0">
              <button
                className={`relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full border-none p-0.5 transition-colors ${reminder.enabled ? 'justify-end bg-primary' : 'bg-gray-300 dark:bg-[#244730]'}`}
                onClick={() => toggleReminder(reminder.id)}
              >
                <div className="h-[27px] w-[27px] rounded-full bg-white shadow-md"></div>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Reminder Button */}
      <div className="px-4 pb-4">
        <button
            onClick={() => {
                if (store.routines.length > 0) {
                    const reminder = {
                        id: `reminder-${crypto.randomUUID()}`,
                        routineId: store.routines[0].id,
                        enabled: true,
                        timeOfDay: '08:00',
                        createdAt: new Date().toISOString()
                    };
                    update(s => ({...s, reminders: [...s.reminders, reminder]}));
                }
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 dark:border-[#244730] bg-transparent py-3 text-[#4b6354] dark:text-[#93c8a5] hover:bg-gray-50 dark:hover:bg-[#244730]/30 transition-colors"
        >
          <span className="material-symbols-outlined">add_circle</span>
          <span className="text-sm font-medium">Add another time</span>
        </button>
      </div>

      {/* Honest Reminder Box */}
      <div className="p-4 mt-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl bg-blue-50 dark:bg-[#1a3222] p-6 border border-blue-100 dark:border-[#244730]">
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 dark:text-primary">info</span>
              <h3 className="text-[#112116] dark:text-white font-bold text-lg">Honest Reminder</h3>
            </div>
            <p className="text-[#4b6354] dark:text-[#93c8a5] text-sm leading-relaxed">
                Reminders work best when you open the app daily. We use local notifications only to protect your privacy and ensure your data stays on your device.
            </p>
          </div>
          <button
            onClick={() => browserNotifications.send('Breathing test', { body: 'This is a test notification.' })}
            className="shrink-0 whitespace-nowrap rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-[#112116] hover:bg-primary/90 transition-colors"
          >
            Test Reminder
          </button>
        </div>
      </div>
    </div>
  );
};
