import { describe, expect, it } from 'bun:test';

import { ValueFailure } from '../../errors';
import { failureOf } from '../../errors/__tests__/invalid-value.fixtures';
import { BlockPath } from '../block-path.value-object';

describe('BlockPath.create', () => {
  it('should keep the path of a Markdown file below the blocks folder', () => {
    // Act
    const path = BlockPath.create('implementations/bun/bun.md');

    // Assert
    expect<string>(path).toBe('implementations/bun/bun.md');
  });

  it.each([
    {
      condition: 'it starts from the root of the file system',
      text: '/blocks/core/core.md',
    },
    {
      condition: 'it names no Markdown file',
      text: 'core/core.mdx',
    },
  ])('should refuse the text when $condition', ({ text }) => {
    // Act
    const failure = failureOf(() => BlockPath.create(text));

    // Assert
    expect(failure).toStrictEqual({
      code: ValueFailure.BlockPathInvalid,
      details: {
        value: text,
      },
    });
  });
});

describe('BlockPath.is', () => {
  it.each([
    {
      candidate: 'core/core.md',
      condition: 'a Markdown file below the blocks folder',
      expected: true,
    },
    {
      candidate: 'core/notes.txt',
      condition: 'a file of another format',
      expected: false,
    },
    {
      candidate: undefined,
      condition: 'no text',
      expected: false,
    },
  ])('should answer $expected when the candidate is $condition', ({ candidate, expected }) => {
    // Act
    const isBlockPath = BlockPath.is(candidate);

    // Assert
    expect(isBlockPath).toBe(expected);
  });
});
