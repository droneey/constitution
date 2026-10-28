import { describe, expect, it } from 'bun:test';

import { AbsolutePath } from '#/kernel/value-objects';

import { folderPathOf } from '../folder-path.utils';

describe('folderPathOf', () => {
  it.each([
    {
      condition: 'it opens with "/"',
      expected: '/work/other',
      given: '/work/other',
    },
    {
      condition: 'it does not open with "/"',
      expected: '/work/project/packages/app',
      given: 'packages/app',
    },
  ])('should give the folder as an absolute path when $condition', ({ expected, given }) => {
    // Arrange
    const asked = {
      from: AbsolutePath.create('/work/project'),
      given,
    };

    // Act
    const folderPath = folderPathOf(asked);

    // Assert
    expect(folderPath).toBe(AbsolutePath.create(expected));
  });
});
