import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoalCategory } from '../types';
import { useStore } from '../ui/hooks/useStore';
import { Card } from '../ui/components/Card';
import { SegmentedControl } from '../ui/components/SegmentedControl';
import { Button } from '../ui/components/Button';

const goalLabels: Record<GoalCategory, string> = {
  bp: 'Lower BP',
  relax: 'Relax',
  focus: 'Focus',
  sleep: 'Sleep',
  panic: 'Panic'
};

export const ExercisesPage: React.FC = () => {
  const { store } = useStore();
  const navigate = useNavigate();
  const [activeGoal, setActiveGoal] = useState<GoalCategory>('bp');

  const exercises = store.exercises.filter((exercise) => exercise.goalCategory === activeGoal);

  return (
    <div className="list">
      <Card>
        <h2>Exercises</h2>
        <SegmentedControl
          segments={(Object.keys(goalLabels) as GoalCategory[]).map((goal) => ({ id: goal, label: goalLabels[goal] }))}
          active={activeGoal}
          onChange={setActiveGoal}
        />
      </Card>
      {exercises.map((exercise) => (
        <Card key={exercise.id}>
          <h3>{exercise.name}</h3>
          <p>{exercise.description}</p>
          <Button onClick={() => navigate(`/exercises/${exercise.id}`)}>Details</Button>
        </Card>
      ))}
    </div>
  );
};
