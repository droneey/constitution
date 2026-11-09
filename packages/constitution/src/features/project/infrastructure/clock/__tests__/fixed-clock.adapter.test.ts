import { describe, expect, it } from 'bun:test';

import { createFixedClock } from '../fixed-clock.adapter';

describe('createFixedClock', () => {
  it('should give its day when asked for today', () => {
    // Arrange
    const day = Temporal.PlainDate.from('2026-06-15');

    // Act
    const today = createFixedClock(day).today();

    // Assert
    expect(today).toBe(day);
  });
});
