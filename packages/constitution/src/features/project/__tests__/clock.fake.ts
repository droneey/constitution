import type { Clock } from '../application/contracts';

const createFakeClock = (today: Temporal.PlainDate): Clock => ({
  today: (): Temporal.PlainDate => today,
});

export { createFakeClock };
