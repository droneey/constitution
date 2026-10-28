import { describe, expect, it } from 'bun:test';

import { clockOf, TODAY_VARIABLE } from '../configuration';
import { ConfigurationFailure, isConfigurationError } from '../configuration.error';

const failureOf = (
  read: () => unknown,
):
  | {
      readonly code: ConfigurationFailure;
      readonly details: object;
      readonly name: string;
    }
  | undefined => {
  try {
    read();
  } catch (error) {
    return isConfigurationError(error)
      ? {
          code: error.code,
          details: error.details,
          name: error.name,
        }
      : undefined;
  }

  return undefined;
};

describe('clockOf', () => {
  it("should read the system's day when the environment fixes none", () => {
    // Arrange
    const today = undefined;

    // Act
    const clock = clockOf(today);

    // Assert
    expect(clock.today().equals(Temporal.Now.plainDateISO())).toBe(true);
  });

  it('should give the fixed day whatever the date when the environment names one', () => {
    // Arrange
    const today = '2026-06-15';

    // Act
    const clock = clockOf(today);

    // Assert
    expect(clock.today().toString()).toBe('2026-06-15');
  });

  it.each([
    {
      condition: 'it is not written YYYY-MM-DD',
      today: '2026-6-15',
    },
  ])('should fail at once when the fixed day $condition', ({ today }) => {
    // Act
    const failure = failureOf(() => clockOf(today));

    // Assert
    expect(failure).toStrictEqual({
      code: ConfigurationFailure.DayMalformed,
      details: {
        variable: TODAY_VARIABLE,
        written: today,
      },
      name: 'ConfigurationError',
    });
  });
});
