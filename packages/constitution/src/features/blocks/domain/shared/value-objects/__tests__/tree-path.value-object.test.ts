import { describe, expect, it } from 'bun:test';

import { InvalidValueError } from '#/kernel/errors';

import { BlockValueFailure } from '../../errors';
import { TreePath } from '../tree-path.value-object';

describe('TreePath', () => {
  it.each([
    {
      condition: 'it names a file below the root',
      given: 'blocks/core/core.md',
      isPath: true,
    },
    {
      condition: 'it is empty',
      given: '',
      isPath: false,
    },
    {
      condition: 'it is absolute',
      given: '/blocks/core/core.md',
      isPath: false,
    },
    {
      condition: 'it climbs above the root',
      given: '../blocks/core/core.md',
      isPath: false,
    },
    {
      condition: 'it is not written one way',
      given: 'blocks/./core/core.md',
      isPath: false,
    },
    {
      condition: 'it is no text',
      given: 7,
      isPath: false,
    },
  ])('should say $isPath when $condition', ({ given, isPath }) => {
    // Act
    const answer = TreePath.is(given);

    // Assert
    expect(answer).toBe(isPath);
  });

  it('should make the path a file below the root gives', () => {
    // Arrange
    const text = 'blocks/core/core.md';

    // Act
    const path = TreePath.create(text);

    // Assert
    expect<string>(path).toBe(text);
  });

  it('should refuse a text that climbs above the root', () => {
    // Act
    const act = (): TreePath => TreePath.create('../core.md');

    // Assert
    expect(act).toThrow(
      new InvalidValueError({
        code: BlockValueFailure.TreePath,
        details: {
          text: '../core.md',
        },
      }),
    );
  });
});
