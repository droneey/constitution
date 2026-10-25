import type { Clock } from '#/features/project';
import { createFixedClock, createSystemClock } from '#/features/project/adapters/clock';
import { attempted, isRangeError } from '#/kernel/utils';

import { ConfigurationError, ConfigurationFailure } from './configuration.error';

/** The environment variable the specs fix the day by; no user sets it. */
const TODAY_VARIABLE = 'CONSTITUTION_TODAY';
const DAY_FORM = /^\d{4}-\d{2}-\d{2}$/;

const dayOf = (text: string): Temporal.PlainDate | undefined =>
  DAY_FORM.test(text)
    ? attempted({
        effect: () => Temporal.PlainDate.from(text),
        isRecognised: isRangeError,
      })
    : undefined;

/**
 * The clock the program reads the day from: a fixed day when the environment names one, the
 * system's otherwise. A day written otherwise than YYYY-MM-DD gives a clock that refuses to be
 * read, so the command that needs the day fails with a ConfigurationError.
 */
const clockOf = (today: string | undefined): Clock => {
  if (today === undefined) {
    return createSystemClock();
  }

  const day = dayOf(today);

  if (day === undefined) {
    return {
      today: (): Temporal.PlainDate => {
        throw new ConfigurationError({
          code: ConfigurationFailure.DayMalformed,
          details: {
            variable: TODAY_VARIABLE,
            written: today,
          },
        });
      },
    };
  }

  return createFixedClock(day);
};

export { clockOf, TODAY_VARIABLE };
