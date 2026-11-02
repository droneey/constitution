import type { Clock } from '../../application/contracts';

const createFixedClock = (today: Temporal.PlainDate): Clock => ({
  today: (): Temporal.PlainDate => today,
});

export { createFixedClock };
