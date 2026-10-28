import type { Clock } from '#/features/project';
import { createFixedClock, createSystemClock } from '#/features/project/adapters/clock';
import { dayOf } from '#/kernel/utils';

import { ConfigurationError, ConfigurationFailure } from './configuration.error';

/** The environment variable the specs fix the day by; no user sets it. */
const TODAY_VARIABLE = 'CONSTITUTION_TODAY';

/**
 * The clock the program reads the day from: a fixed day when the environment names one, the
 * system's otherwise.
 *
 * @throws {@link ConfigurationError} when the day is written otherwise than YYYY-MM-DD
 */
const clockOf = (today: string | undefined): Clock => {
  if (today === undefined) {
    return createSystemClock();
  }

  const day = dayOf(today);

  if (day === undefined) {
    throw new ConfigurationError({
      code: ConfigurationFailure.DayMalformed,
      details: {
        variable: TODAY_VARIABLE,
        written: today,
      },
    });
  }

  return createFixedClock(day);
};

export { clockOf, TODAY_VARIABLE };
