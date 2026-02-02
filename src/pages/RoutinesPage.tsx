import React from 'react';
import { useNavigate } from 'react-router-dom';
import { seedTemplates } from '../seed';
import { Routine } from '../types';
import { useStore } from '../ui/hooks/useStore';
import { Card } from '../ui/components/Card';
import { Button } from '../ui/components/Button';

const createRoutineFromTemplate = (templateId: string, templates: typeof seedTemplates): Routine | undefined => {
  const template = templates.find((item) => item.id === templateId);
  if (!template) return undefined;
  return {
    id: `routine-${crypto.randomUUID()}`,
    name: template.name,
    description: template.description,
    goalCategory: template.goalCategory,
    items: template.items
  };
};

export const RoutinesPage: React.FC = () => {
  const { store, update } = useStore();
  const navigate = useNavigate();

  const createBlankRoutine = () => {
    update((current) => ({
      ...current,
      routines: [
        ...current.routines,
        {
          id: `routine-${crypto.randomUUID()}`,
          name: 'New routine',
          description: 'Edit to customize this routine.',
          goalCategory: 'relax',
          items: []
        }
      ]
    }));
  };

  const addTemplate = (templateId: string) => {
    update((current) => {
      const routine = createRoutineFromTemplate(templateId, seedTemplates);
      if (!routine) return current;
      return { ...current, routines: [...current.routines, routine] };
    });
  };

  return (
    <div className="list">
      <Card>
        <h2>Your routines</h2>
        {store.routines.length === 0 ? <p>No routines yet. Add from templates below.</p> : null}
        <Button variant="secondary" onClick={createBlankRoutine}>
          Create blank routine
        </Button>
      </Card>
      {store.routines.map((routine) => (
        <Card key={routine.id}>
          <h3>{routine.name}</h3>
          <p>{routine.description}</p>
          <Button onClick={() => navigate(`/routines/${routine.id}`)}>View</Button>
        </Card>
      ))}
      <Card>
        <h2>Templates</h2>
        <div className="list">
          {seedTemplates.map((template) => (
            <div key={template.id} className="card">
              <h3>{template.name}</h3>
              <p>{template.description}</p>
              <Button onClick={() => addTemplate(template.id)}>Add to library</Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
