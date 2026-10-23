import type { Clock } from '../domain/contracts';

const createFakeClock = (today: string): Clock => ({
  today: (): string => today,
});

export { createFakeClock };
