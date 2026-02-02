export interface Clock {
  now: () => Date;
}

export const realClock: Clock = {
  now: () => new Date()
};

export const createFakeClock = (start: Date): Clock & { advanceBySec: (sec: number) => void } => {
  let current = start.getTime();
  return {
    now: () => new Date(current),
    advanceBySec: (sec: number) => {
      current += sec * 1000;
    }
  };
};
