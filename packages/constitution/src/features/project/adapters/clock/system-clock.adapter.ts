import type { Clock } from '../../domain/contracts';

const createSystemClock = (): Clock => ({
  today: (): Temporal.PlainDate => Temporal.Now.plainDateISO(),
});

export { createSystemClock };
