import React from 'react';
import { Card } from '../ui/components/Card';

export const AboutPage: React.FC = () => (
  <div className="list">
    <Card>
      <h2>Safety + reminder limitations</h2>
      <p>
        This app supports breathing routines but does not replace medical care. If you are experiencing a medical
        emergency, seek professional help.
      </p>
      <p>
        Background reminders are limited on mobile browsers, especially iOS Safari. The reliable reminder method is the
        in-app banner shown when the app is opened or brought to the foreground.
      </p>
    </Card>
  </div>
);
