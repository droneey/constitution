import { describe, expect, it } from 'bun:test';

import { mutateArgumentsOf } from '../mutate-arguments.ts';

describe('mutateArgumentsOf', () => {
  it('should list the lines of one file and the whole of another when both are targets', () => {
    // Arrange
    const targets = [
      {
        lines: {
          end: 5,
          start: 3,
        },
        path: 'src/order.utils.ts',
      },
      {
        path: 'src/line.utils.ts',
      },
    ];

    // Act
    const found = mutateArgumentsOf(targets);

    // Assert
    expect(found).toStrictEqual([
      '--mutate',
      'src/order.utils.ts:3-5,src/line.utils.ts',
    ]);
  });

  // Each pattern was seen to resolve to its one file on a real Stryker run.
  it.each([
    {
      condition: 'a dollar sign, which no glob reads',
      path: 'src/a$b.ts',
      pattern: 'src/a$b.ts:1-1',
    },
    {
      condition: 'braces',
      path: 'src/routes/{id}.ts',
      pattern: 'src/routes/[{]id[}].ts:1-1',
    },
    {
      condition: 'brackets',
      path: 'src/routes/llms[.]txt.ts',
      pattern: 'src/routes/llms[[].[]]txt.ts:1-1',
    },
    {
      condition: 'an asterisk',
      path: 'src/a*b.ts',
      pattern: 'src/a[*]b.ts:1-1',
    },
    {
      condition: 'a question mark',
      path: 'src/a?b.ts',
      pattern: 'src/a[?]b.ts:1-1',
    },
    {
      condition: 'parentheses',
      path: 'src/(app).ts',
      pattern: 'src/[(]app[)].ts:1-1',
    },
    {
      condition: 'an exclamation mark inside',
      path: 'src/a!(b).ts',
      pattern: 'src/a![(]b[)].ts:1-1',
    },
    {
      condition: 'an exclamation mark first',
      path: '!a.ts',
      pattern: './!a.ts:1-1',
    },
  ])('should name the file literally when its name holds $condition', ({ path, pattern }) => {
    // Arrange
    const targets = [
      {
        lines: {
          end: 1,
          start: 1,
        },
        path,
      },
    ];

    // Act
    const found = mutateArgumentsOf(targets);

    // Assert
    expect(found).toStrictEqual([
      '--mutate',
      pattern,
    ]);
  });

  it('should name a whole file literally when its name holds glob characters', () => {
    // Arrange
    const targets = [
      {
        path: 'src/routes/{$}[.]md.ts',
      },
    ];

    // Act
    const found = mutateArgumentsOf(targets);

    // Assert
    expect(found).toStrictEqual([
      '--mutate',
      'src/routes/[{]$[}][[].[]]md.ts',
    ]);
  });
});
