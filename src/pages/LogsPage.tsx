import React, { useMemo, useState } from 'react';
import { useStore } from '../ui/hooks/useStore';
import { Card } from '../ui/components/Card';
import { Button } from '../ui/components/Button';

export const LogsPage: React.FC = () => {
  const { store, update } = useStore();
  const [sys, setSys] = useState('');
  const [dia, setDia] = useState('');
  const [notes, setNotes] = useState('');

  const stats = useMemo(() => {
    const totalSessions = store.logs.length;
    const totalMinutes = Math.round(store.logs.reduce((sum, log) => sum + log.durationSec, 0) / 60);
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weeklyMinutes = Math.round(
      store.logs.filter((log) => new Date(log.completedAt).getTime() >= weekAgo).reduce((sum, log) => sum + log.durationSec, 0) / 60
    );
    return { totalSessions, totalMinutes, weeklyMinutes };
  }, [store.logs]);

  const addVitalsToLast = () => {
    if (!store.logs[0]) return;
    update((current) => ({
      ...current,
      logs: current.logs.map((log, index) =>
        index === 0
          ? {
              ...log,
              bpSys: sys ? Number(sys) : undefined,
              bpDia: dia ? Number(dia) : undefined,
              notes: notes || undefined
            }
          : log
      )
    }));
  };

  return (
    <div className="list">
      <Card>
        <h2>Session logs</h2>
        <p>Total sessions: {stats.totalSessions}</p>
        <p>Total minutes: {stats.totalMinutes}</p>
        <p>Weekly minutes: {stats.weeklyMinutes}</p>
      </Card>
      <Card>
        <h3>Add BP + notes to last session</h3>
        <div className="form-grid">
          <label>
            Systolic
            <input value={sys} onChange={(event) => setSys(event.target.value)} />
          </label>
          <label>
            Diastolic
            <input value={dia} onChange={(event) => setDia(event.target.value)} />
          </label>
          <label>
            Notes
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
          </label>
          <Button onClick={addVitalsToLast}>Save notes</Button>
        </div>
      </Card>
      {store.logs.map((log) => (
        <Card key={log.id}>
          <p>
            {new Date(log.completedAt).toLocaleString()} — {Math.round(log.durationSec / 60)} min
          </p>
          {log.bpSys && log.bpDia ? <p>BP: {log.bpSys}/{log.bpDia}</p> : null}
          {log.notes ? <p>Notes: {log.notes}</p> : null}
        </Card>
      ))}
    </div>
  );
};
