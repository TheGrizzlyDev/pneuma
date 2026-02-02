export interface NotificationAdapter {
  isSupported: boolean;
  permission: NotificationPermission | 'unsupported';
  requestPermission: () => Promise<NotificationPermission | 'unsupported'>;
  send: (title: string, options?: NotificationOptions) => void;
}

export const browserNotifications: NotificationAdapter = {
  isSupported: typeof window !== 'undefined' && 'Notification' in window,
  get permission() {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission;
  },
  async requestPermission() {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.requestPermission();
  },
  send(title, options) {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      new Notification(title, options);
    }
  }
};
