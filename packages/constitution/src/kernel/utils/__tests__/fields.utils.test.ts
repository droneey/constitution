import { describe, expect, it } from 'bun:test';

import { fieldsOf, isDeepEqual } from '../fields.utils';

describe('fieldsOf', () => {
  it.each([
    {
      candidate: {
        axis: 'foundation',
      },
      condition: 'the candidate is an object',
      expected: {
        axis: 'foundation',
      },
    },
    {
      candidate: undefined,
      condition: 'the candidate is undefined',
      expected: {},
    },
  ])('should give the own fields when $condition', ({ candidate, expected }) => {
    // Act
    const fields = fieldsOf(candidate);

    // Assert
    expect(Object.fromEntries(fields)).toStrictEqual(expected);
  });
});

describe('isDeepEqual', () => {
  it.each([
    {
      condition: 'two texts are one',
      isEqual: true,
      left: 'core',
      right: 'core',
    },
    {
      condition: 'two texts differ',
      isEqual: false,
      left: 'core',
      right: 'self',
    },
    {
      condition: 'two objects hold the same fields at every depth',
      isEqual: true,
      left: {
        file: {
          kind: 'passport',
        },
        path: 'a.md',
      },
      right: {
        file: {
          kind: 'passport',
        },
        path: 'a.md',
      },
    },
    {
      condition: 'two objects differ at a depth',
      isEqual: false,
      left: {
        file: {
          kind: 'passport',
        },
      },
      right: {
        file: {
          kind: 'chapter',
        },
      },
    },
    {
      condition: 'the right object holds a field more',
      isEqual: false,
      left: {
        path: 'a.md',
      },
      right: {
        layer: 'core',
        path: 'a.md',
      },
    },
    {
      condition: 'the objects hold undefined under different keys',
      isEqual: false,
      left: {
        path: undefined,
      },
      right: {
        dir: undefined,
      },
    },
    {
      condition: 'the left is a text and the right an object of its characters',
      isEqual: false,
      left: 'ab',
      right: {
        0: 'a',
        1: 'b',
      },
    },
    {
      condition: 'the left is an object of its characters and the right a text',
      isEqual: false,
      left: {
        0: 'a',
        1: 'b',
      },
      right: 'ab',
    },
    {
      condition: 'the left is undefined and the right an empty object',
      isEqual: false,
      left: undefined,
      right: {},
    },
  ])('should say $isEqual when $condition', ({ isEqual, left, right }) => {
    // Arrange
    const pair: readonly [
      unknown,
      unknown,
    ] = [
      left,
      right,
    ];

    // Act
    const answer = isDeepEqual(...pair);

    // Assert
    expect(answer).toBe(isEqual);
  });
});
