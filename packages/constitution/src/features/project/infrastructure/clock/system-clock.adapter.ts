import type { Clock } from '../../application/contracts';

const createSystemClock = (): Clock => ({
  today: (): Temporal.PlainDate => Temporal.Now.plainDateISO(),
});

export { createSystemClock };
