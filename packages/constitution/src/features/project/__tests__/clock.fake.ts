import type { Clock } from '../domain/contracts';

const createFakeClock = (today: Temporal.PlainDate): Clock => ({
  today: (): Temporal.PlainDate => today,
});

export { createFakeClock };
