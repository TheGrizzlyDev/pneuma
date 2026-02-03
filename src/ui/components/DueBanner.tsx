import React from 'react';
import { Reminder, Routine } from '../../types';

interface DueBannerProps {
  reminder: Reminder;
  routine: Routine | undefined;
  onStart: () => void;
  onSnooze: () => void;
  onDismiss: () => void;
}

export const DueBanner: React.FC<DueBannerProps> = ({ reminder, routine, onStart, onSnooze, onDismiss }) => (
  <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
    <div>
      <p className="text-primary font-bold text-sm uppercase tracking-wider mb-1">Reminder due</p>
      <h3 className="text-[#112116] dark:text-white font-bold text-lg">{routine?.name ?? 'Routine'} is ready</h3>
      <p className="text-[#4b6354] dark:text-[#93c8a5] text-sm">Scheduled for {reminder.timeOfDay}</p>
    </div>
    <div className="flex flex-wrap gap-2">
      <button
        onClick={onStart}
        className="bg-primary text-[#112217] px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#16cc52] transition-colors"
      >
        Start
      </button>
      <button
        onClick={onSnooze}
        className="bg-gray-200 dark:bg-[#244730] text-[#112116] dark:text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"
      >
        Snooze 10m
      </button>
      <button
        onClick={onDismiss}
        className="text-[#4b6354] dark:text-[#93c8a5] px-4 py-2 rounded-lg text-sm font-medium hover:underline transition-all"
      >
        Dismiss
      </button>
    </div>
  </div>
);
