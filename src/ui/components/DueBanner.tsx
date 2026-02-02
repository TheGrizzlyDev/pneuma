import React from 'react';
import { Reminder, Routine } from '../../types';
import { Button } from './Button';

interface DueBannerProps {
  reminder: Reminder;
  routine: Routine | undefined;
  onStart: () => void;
  onSnooze: () => void;
  onDismiss: () => void;
}

export const DueBanner: React.FC<DueBannerProps> = ({ reminder, routine, onStart, onSnooze, onDismiss }) => (
  <div className="banner">
    <div>
      <p className="banner-title">Reminder due</p>
      <p className="banner-body">{routine?.name ?? 'Routine'} is ready to start now.</p>
      <p className="banner-sub">Time: {reminder.timeOfDay}</p>
    </div>
    <div className="banner-actions">
      <Button onClick={onStart}>Start</Button>
      <Button variant="secondary" onClick={onSnooze}>
        Snooze 10m
      </Button>
      <Button variant="ghost" onClick={onDismiss}>
        Dismiss
      </Button>
    </div>
  </div>
);
