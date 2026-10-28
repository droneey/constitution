import { describe, expect, it } from 'bun:test';

import { failureOf } from '#/__tests__/failure.fixtures.ts';
import { InvalidValueError } from '#/kernel/errors';

import { TargetsValueFailure } from '../../errors';
import { LineRange } from '../line-range.value-object.ts';

describe('LineRange', () => {
  it.each([
    {
      condition: 'it starts before the first line',
      endLine: 2,
      startLine: 0,
      text: '0-2',
    },
    {
      condition: 'it runs backward',
      endLine: 2,
      startLine: 3,
      text: '3-2',
    },
    {
      condition: 'it ends inside a line',
      endLine: 2.5,
      startLine: 1,
      text: '1-2.5',
    },
    {
      condition: 'it starts inside a line',
      endLine: 2,
      startLine: 1.5,
      text: '1.5-2',
    },
  ])('should refuse a range when $condition', async ({ endLine, startLine, text }) => {
    // Act
    const failure = await failureOf({
      call: () =>
        LineRange.create({
          endLine,
          startLine,
        }),
      kind: InvalidValueError,
    });

    // Assert
    expect(failure?.details).toStrictEqual({
      code: TargetsValueFailure.LineRange,
      text,
    });
  });
});
