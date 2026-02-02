import React, { useState } from 'react';
import { browserNotifications } from '../platform/notifications';
import { useStore } from '../ui/hooks/useStore';
import { Button } from '../ui/components/Button';
import { Card } from '../ui/components/Card';

export const SettingsPage: React.FC = () => {
  const { store, update } = useStore();
  const [importError, setImportError] = useState('');

  const toggleSetting = (key: 'soundEnabled' | 'vibrationEnabled' | 'reducedMotion') => {
    update((current) => ({
      ...current,
      settings: { ...current.settings, [key]: !current.settings[key] }
    }));
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(store, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'bp-breathing-data.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (!data || !data.version) throw new Error('Invalid file');
        update(() => data);
        setImportError('');
      } catch {
        setImportError('Import failed. Ensure the JSON was exported from this app.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="list">
      <Card>
        <h2>Settings</h2>
        <div className="form-grid">
          <label>
            <input type="checkbox" checked={store.settings.soundEnabled} onChange={() => toggleSetting('soundEnabled')} />
            Sound cues
          </label>
          <label>
            <input
              type="checkbox"
              checked={store.settings.vibrationEnabled}
              onChange={() => toggleSetting('vibrationEnabled')}
            />
            Vibration cues
          </label>
          <label>
            <input type="checkbox" checked={store.settings.reducedMotion} onChange={() => toggleSetting('reducedMotion')} />
            Reduced motion
          </label>
        </div>
      </Card>
      <Card>
        <h3>Notifications</h3>
        <p>Status: {browserNotifications.permission}</p>
        <Button variant="secondary" onClick={() => browserNotifications.requestPermission()}>
          Request permission
        </Button>
      </Card>
      <Card>
        <h3>Export / Import</h3>
        <Button onClick={exportData}>Export JSON</Button>
        <label>
          Import JSON
          <input type="file" accept="application/json" onChange={importData} />
        </label>
        {importError ? <p>{importError}</p> : null}
      </Card>
    </div>
  );
};
