import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../ui/hooks/useStore';
import { Card } from '../ui/components/Card';
import { Button } from '../ui/components/Button';

export const ExerciseDetailPage: React.FC = () => {
  const { id } = useParams();
  const { store } = useStore();
  const navigate = useNavigate();
  const exercise = store.exercises.find((item) => item.id === id);

  if (!exercise) {
    return <Card>Exercise not found.</Card>;
  }

  return (
    <div className="list">
      <Card>
        <h2>{exercise.name}</h2>
        <p>{exercise.description}</p>
        <ul>
          {exercise.phases.map((phase, index) => (
            <li key={`${phase.name}-${index}`}>
              {phase.name}: {phase.seconds}s
            </li>
          ))}
        </ul>
        <p>Default duration: {Math.round(exercise.defaultDurationSec / 60)} min</p>
        <Button onClick={() => navigate(`/player?exerciseId=${exercise.id}`)}>Start exercise</Button>
      </Card>
    </div>
  );
};
