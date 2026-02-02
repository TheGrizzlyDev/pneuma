import React from 'react';
import { useNavigate } from 'react-router-dom';
import { seedTemplates } from '../seed';
import { computeNextOccurrence } from '../domain/reminders';
import { useStore } from '../ui/hooks/useStore';
import { Card } from '../ui/components/Card';
import { Button } from '../ui/components/Button';

export const HomePage: React.FC = () => {
  const { store } = useStore();
  const navigate = useNavigate();
  const lastLog = [...store.logs].sort((a, b) => b.completedAt.localeCompare(a.completedAt))[0];
  const lastRoutine = store.routines.find((routine) => routine.id === lastLog?.routineId);
  const remindersToday = store.reminders
    .filter((reminder) => reminder.enabled)
    .map((reminder) => ({
      reminder,
      next: computeNextOccurrence(reminder, new Date())
    }))
    .sort((a, b) => a.next.getTime() - b.next.getTime());

  return (
    <div className="list">
      <Card>
        <h2>Quick starts</h2>
        <div className="list">
          {seedTemplates.slice(0, 3).map((template) => (
            <div key={template.id} className="card">
              <h3>{template.name}</h3>
              <p>{template.description}</p>
              <Button onClick={() => navigate(`/player?templateId=${template.id}`)}>Start</Button>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h2>Today's reminders</h2>
        {remindersToday.length === 0 ? (
          <p>No reminders yet. Add one to stay consistent.</p>
        ) : (
          <ul>
            {remindersToday.map(({ reminder, next }) => (
              <li key={reminder.id}>
                {store.routines.find((routine) => routine.id === reminder.routineId)?.name ?? 'Routine'} —
                {next.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card>
        <h2>Last completed</h2>
        {lastRoutine ? (
          <div>
            <p>{lastRoutine.name}</p>
            <Button onClick={() => navigate(`/player?routineId=${lastRoutine.id}`)}>Start again</Button>
          </div>
        ) : (
          <p>Complete a routine to see it here.</p>
        )}
      </Card>
    </div>
  );
};
