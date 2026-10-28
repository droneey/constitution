import { describe, expect, it } from 'bun:test';

import { UnitRelativePath } from '#/kernel/value-objects';

import { LineRange } from '../../../domain/value-objects';
import { mutateArgumentsOf } from '../mutate-arguments.utils.ts';

describe('mutateArgumentsOf', () => {
  // Each pattern was seen to resolve to its one file on a real Stryker run.
  it.each([
    {
      condition: 'an exclamation mark inside',
      filePath: 'src/a!(b).ts',
      pattern: 'src/a![(]b[)].ts:1-1',
    },
    {
      condition: 'an exclamation mark first',
      filePath: '!a.ts',
      pattern: './!a.ts:1-1',
    },
  ])('should name the file literally when its name holds $condition', ({ filePath, pattern }) => {
    // Arrange
    const targets = [
      {
        lineRange: LineRange.create({
          endLine: 1,
          startLine: 1,
        }),
        filePath: UnitRelativePath.create(filePath),
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
});
