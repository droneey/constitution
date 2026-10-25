import type { Clock } from '../../domain/contracts';

const createFixedClock = (today: Temporal.PlainDate): Clock => ({
  today: (): Temporal.PlainDate => today,
});

export { createFixedClock };
