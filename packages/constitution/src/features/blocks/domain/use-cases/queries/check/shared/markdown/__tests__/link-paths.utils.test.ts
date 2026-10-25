import { describe, expect, it } from 'bun:test';

import { resolveLink } from '../link-paths.utils';

describe('resolveLink', () => {
  it.each([
    {
      expected: '.',
      name: 'a link to the root itself',
      target: '/',
    },
  ])(
    'should resolve $name to $expected when blocks/core/core.md holds it',
    ({ expected, target }) => {
      // Arrange
      const link = {
        path: 'blocks/core/core.md',
        target,
      };

      // Act
      const resolved = resolveLink(link);

      // Assert
      expect(resolved).toBe(expected);
    },
  );
});
