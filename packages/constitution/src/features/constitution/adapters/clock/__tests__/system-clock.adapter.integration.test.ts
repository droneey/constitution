import { describe, expect, it } from 'bun:test';

import { createSystemClock } from '../system-clock.adapter';

describe('createSystemClock', () => {
  it('should give the date of the zone it runs in as YYYY-MM-DD when asked for today', () => {
    // Arrange
    const clock = createSystemClock();

    // Act
    const today = clock.today();

    // Assert
    expect({
      isDateForm: /^\d{4}-\d{2}-\d{2}$/.test(today),
      isToday: today === Temporal.Now.plainDateISO().toString(),
    }).toStrictEqual({
      isDateForm: true,
      isToday: true,
    });
  });
});
