import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { buildPlayPlan } from '../domain/schedule';
import { useStore } from '../ui/hooks/useStore';
import { Card } from '../ui/components/Card';
import { Button } from '../ui/components/Button';

const formatDuration = (seconds: number) => `${Math.round(seconds / 60)} min`;

export const RoutineDetailPage: React.FC = () => {
  const { id } = useParams();
  const { store } = useStore();
  const navigate = useNavigate();
  const routine = store.routines.find((item) => item.id === id);

  if (!routine) {
    return <Card>Routine not found.</Card>;
  }

  let estimatedSec = 0;
  try {
    const plan = buildPlayPlan(routine, store.exercises);
    estimatedSec = plan.reduce((sum, segment) => sum + segment.durationSec, 0);
  } catch {
    estimatedSec = 0;
  }
  const reminders = store.reminders.filter((reminder) => reminder.routineId === routine.id && reminder.enabled);

  return (
    <div className="list">
      <Card>
        <h2>{routine.name}</h2>
        <p>{routine.description}</p>
        <p>Estimated time: {formatDuration(estimatedSec)}</p>
        <Button onClick={() => navigate(`/player?routineId=${routine.id}`)}>Start routine</Button>
        <Button variant="secondary" onClick={() => navigate(`/routines/${routine.id}/edit`)}>
          Edit routine
        </Button>
      </Card>
      <Card>
        <h3>Routine items</h3>
        <ul>
          {routine.items.map((item, index) => (
            <li key={`${item.exerciseId}-${index}`}>
              {store.exercises.find((exercise) => exercise.id === item.exerciseId)?.name ?? 'Exercise'} — x{item.repeat}
            </li>
          ))}
        </ul>
      </Card>
      <Card>
        <h3>Reminders</h3>
        {reminders.length === 0 ? <p>No reminders yet.</p> : null}
        <ul>
          {reminders.map((reminder) => (
            <li key={reminder.id}>{reminder.timeOfDay}</li>
          ))}
        </ul>
        <Button variant="secondary" onClick={() => navigate('/reminders')}>
          Manage reminders
        </Button>
      </Card>
    </div>
  );
};
