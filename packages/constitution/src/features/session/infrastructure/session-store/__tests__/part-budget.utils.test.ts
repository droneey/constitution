import { describe, expect, it } from 'bun:test';

import { isPastPartBudget } from '../part-budget.utils';

describe('isPastPartBudget', () => {
  it.each([
    {
      added: [
        'x'.repeat(29_999),
      ],
      condition: 'the lines held and added come to 60,000 bytes with their line breaks',
      expected: false,
      held: [
        'x'.repeat(29_999),
      ],
    },
    {
      added: [
        'x'.repeat(30_000),
      ],
      condition: 'they come to 60,001 bytes',
      expected: true,
      held: [
        'x'.repeat(29_999),
      ],
    },
    {
      added: Array.from(
        {
          length: 750,
        },
        () => '',
      ),
      condition: 'they come to 1,500 lines',
      expected: false,
      held: Array.from(
        {
          length: 750,
        },
        () => '',
      ),
    },
    {
      added: Array.from(
        {
          length: 751,
        },
        () => '',
      ),
      condition: 'they come to 1,501 lines',
      expected: true,
      held: Array.from(
        {
          length: 750,
        },
        () => '',
      ),
    },
  ])(
    'should tell whether a part is past its budget when $condition',
    ({ added, expected, held }) => {
      // Act
      const isPast = isPastPartBudget({
        added,
        held,
      });

      // Assert
      expect(isPast).toBe(expected);
    },
  );
});
