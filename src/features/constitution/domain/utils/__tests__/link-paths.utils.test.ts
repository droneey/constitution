import { describe, expect, it } from 'bun:test';

import { resolveLink, targetFromRoot } from '../link-paths.utils';

describe('resolveLink', () => {
  it.each([
    {
      expected: 'blocks/core',
      name: 'a folder link, its trailing slash dropped',
      target: '../core/',
    },
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

describe('targetFromRoot', () => {
  it.each([
    {
      expected: 'blocks/core/principles.md#laws',
      name: 'a chapter link with its anchor as written',
      target: 'principles.md#laws',
    },
    {
      expected: 'README.md',
      name: 'a link from the root',
      target: '/README.md',
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
      const resolved = targetFromRoot(link);

      // Assert
      expect(resolved).toBe(expected);
    },
  );
});
