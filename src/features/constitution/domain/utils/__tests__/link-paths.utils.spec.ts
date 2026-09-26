import { describe, expect, it } from 'bun:test';

import { resolveLink, targetFromRoot } from '../link-paths.utils';

describe('resolveLink', () => {
  it.each([
    {
      expected: 'blocks/core/principles.md',
      target: 'principles.md',
    },
    {
      expected: 'blocks/domains/ui/ui.md',
      target: '../domains/ui/ui.md',
    },
    {
      expected: 'README.md',
      target: '/README.md',
    },
    {
      expected: 'blocks/core',
      target: '../core/',
    },
    {
      expected: '.',
      target: '../../',
    },
  ])(
    'should resolve $target to $expected when blocks/core/core.md links it',
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
      expected: 'blocks/core/principles.md',
      name: 'a chapter link',
      target: 'principles.md',
    },
    {
      expected: 'blocks/core/principles.md#laws',
      name: 'an anchor kept',
      target: 'principles.md#laws',
    },
    {
      expected: 'blocks/core/principles.md#a/b',
      name: 'an anchor holding a slash kept as written',
      target: 'principles.md#a/b',
    },
    {
      expected: 'README.md',
      name: 'a root-absolute link',
      target: '/README.md',
    },
    {
      expected: '.',
      name: 'a link that climbs to the root',
      target: '../../',
    },
  ])(
    'should resolve $name to $expected when blocks/core/core.md links it',
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
