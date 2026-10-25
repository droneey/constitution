import { describe, expect, it } from 'bun:test';

import { createSystemClock } from '../system-clock.adapter';

describe('createSystemClock', () => {
  it('should give the date of the zone it runs in when asked for today', () => {
    // Arrange
    const clock = createSystemClock();

    // Act
    const today = clock.today();

    // Assert
    expect(today.equals(Temporal.Now.plainDateISO())).toBe(true);
  });
});
