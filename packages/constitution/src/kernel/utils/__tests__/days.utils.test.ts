import { describe, expect, it } from 'bun:test';

import { dayOf } from '../days.utils';

describe('dayOf', () => {
  it('should give the calendar day when the text is written YYYY-MM-DD', () => {
    // Arrange
    const text = '2026-07-01';

    // Act
    const day = dayOf(text);

    // Assert
    expect(day).toStrictEqual(Temporal.PlainDate.from('2026-07-01'));
  });

  it.each([
    {
      name: 'a date with a time',
      text: '2026-07-01T10:00',
    },
    {
      name: 'a date with an expanded year',
      text: '+002026-07-01',
    },
    {
      name: 'a day the month does not have',
      text: '2026-02-30',
    },
    {
      name: 'a word',
      text: 'soon',
    },
  ])('should give none when the text is $name', ({ text }) => {
    // Act
    const day = dayOf(text);

    // Assert
    expect(day).toBeUndefined();
  });
});
