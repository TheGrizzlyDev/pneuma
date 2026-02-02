export interface HapticsAdapter {
  isSupported: boolean;
  vibrate: (pattern: number | number[]) => void;
}

export const browserHaptics: HapticsAdapter = {
  isSupported: typeof navigator !== 'undefined' && 'vibrate' in navigator,
  vibrate(pattern) {
    if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
    navigator.vibrate(pattern);
  }
};
