import type { Clock } from '../../domain/contracts';

// The date in the zone the program runs in, as `date +%Y-%m-%d` prints it.
const createSystemClock = (): Clock => ({
  today: (): string => Temporal.Now.plainDateISO().toString(),
});

export { createSystemClock };
