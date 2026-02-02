import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RoutineItem } from '../types';
import { useStore } from '../ui/hooks/useStore';
import { Card } from '../ui/components/Card';
import { Button } from '../ui/components/Button';

export const RoutineEditPage: React.FC = () => {
  const { id } = useParams();
  const { store, update } = useStore();
  const navigate = useNavigate();
  const routine = store.routines.find((item) => item.id === id);

  const [name, setName] = useState(routine?.name ?? '');
  const [description, setDescription] = useState(routine?.description ?? '');
  const [selectedExercise, setSelectedExercise] = useState(store.exercises[0]?.id ?? '');
  const [repeat, setRepeat] = useState(1);
  const [restBetween, setRestBetween] = useState(0);

  if (!routine) {
    return <Card>Routine not found.</Card>;
  }

  const addItem = () => {
    if (!selectedExercise) return;
    const newItem: RoutineItem = {
      exerciseId: selectedExercise,
      repeat,
      restBetweenRepeatsSec: restBetween || undefined
    };
    update((current) => ({
      ...current,
      routines: current.routines.map((item) =>
        item.id === routine.id ? { ...item, items: [...item.items, newItem] } : item
      )
    }));
  };

  const removeItem = (index: number) => {
    update((current) => ({
      ...current,
      routines: current.routines.map((item) =>
        item.id === routine.id ? { ...item, items: item.items.filter((_, i) => i !== index) } : item
      )
    }));
  };

  const saveRoutine = () => {
    update((current) => ({
      ...current,
      routines: current.routines.map((item) =>
        item.id === routine.id ? { ...item, name, description } : item
      )
    }));
    navigate(`/routines/${routine.id}`);
  };

  return (
    <div className="list">
      <Card>
        <h2>Edit routine</h2>
        <div className="form-grid">
          <label>
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label>
            Description
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>
          <Button onClick={saveRoutine}>Save routine</Button>
        </div>
      </Card>
      <Card>
        <h3>Add exercise</h3>
        <div className="form-grid">
          <label>
            Exercise
            <select value={selectedExercise} onChange={(event) => setSelectedExercise(event.target.value)}>
              {store.exercises.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Repeat
            <input type="number" min={1} value={repeat} onChange={(event) => setRepeat(Number(event.target.value))} />
          </label>
          <label>
            Rest between repeats (sec)
            <input type="number" min={0} value={restBetween} onChange={(event) => setRestBetween(Number(event.target.value))} />
          </label>
          <Button onClick={addItem}>Add item</Button>
        </div>
      </Card>
      <Card>
        <h3>Items</h3>
        {routine.items.length === 0 ? <p>Add an exercise to begin.</p> : null}
        <ul>
          {routine.items.map((item, index) => (
            <li key={`${item.exerciseId}-${index}`}>
              {store.exercises.find((exercise) => exercise.id === item.exerciseId)?.name ?? 'Exercise'} — x{item.repeat}{' '}
              <Button variant="ghost" onClick={() => removeItem(index)}>
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};
