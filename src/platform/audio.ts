export interface AudioAdapter {
  isSupported: boolean;
  playCue: (type: 'in' | 'out' | 'hold' | 'rest') => void;
}

const toneMap: Record<'in' | 'out' | 'hold' | 'rest', number> = {
  in: 440,
  out: 330,
  hold: 520,
  rest: 260
};

export const browserAudio: AudioAdapter = {
  isSupported: typeof window !== 'undefined' && 'AudioContext' in window,
  playCue(type) {
    if (typeof window === 'undefined' || !('AudioContext' in window)) return;
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = toneMap[type];
    gain.gain.value = 0.08;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.12);
    oscillator.onended = () => {
      context.close();
    };
  }
};
