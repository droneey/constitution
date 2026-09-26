import { describe, expect, it } from 'bun:test';

import { classifyBlockPath } from '../block-path.utils';

describe('classifyBlockPath', () => {
  it.each([
    {
      expected: {
        dir: 'blocks/core',
        file: 'main',
        id: 'core',
        layer: 'core',
        name: 'core.md',
        with: null,
      },
      path: 'blocks/core/core.md',
    },
    {
      expected: {
        dir: 'blocks/core',
        file: 'chapter',
        id: 'core',
        layer: 'core',
        name: 'principles.md',
        with: null,
      },
      path: 'blocks/core/principles.md',
    },
    {
      expected: {
        dir: 'blocks/domains/ui',
        file: 'with',
        id: 'ui',
        layer: 'domain',
        name: 'remote-data.md',
        with: 'remote-data',
      },
      path: 'blocks/domains/ui/with/remote-data.md',
    },
    {
      expected: {
        dir: 'blocks/contexts/platforms/browser',
        file: 'main',
        id: 'browser',
        layer: 'platform',
        name: 'browser.md',
        with: null,
      },
      path: 'blocks/contexts/platforms/browser/browser.md',
    },
    {
      expected: {
        dir: 'blocks/contexts/languages/typescript',
        file: 'main',
        id: 'typescript',
        layer: 'language',
        name: 'typescript.md',
        with: null,
      },
      path: 'blocks/contexts/languages/typescript/typescript.md',
    },
    {
      expected: {
        dir: 'blocks/implementations/_react',
        file: 'main',
        id: '_react',
        layer: 'implementation',
        name: '_react.md',
        with: null,
      },
      path: 'blocks/implementations/_react/_react.md',
    },
  ])(
    'should name the layer, block and role of $path when the path is a block file',
    ({ expected, path }) => {
      // Arrange
      const input = path;

      // Act
      const classified = classifyBlockPath(input);

      // Assert
      expect(classified).toStrictEqual(expected);
    },
  );

  it.each([
    'blocks/domains/ui/.DS_Store',
    'blocks/domains/ui/parts/a.md',
    'blocks/domains/ui/with/x/y.md',
    'blocks/domains/ui/notes.txt',
  ])(
    'should call %p stray when it is a hidden, nested or non-markdown file of a block',
    (path) => {
      // Arrange
      const input = path;

      // Act
      const classified = classifyBlockPath(input);

      // Assert
      expect(classified?.file).toBe('stray');
    },
  );

  it.each([
    'blocks/spheres/web/web.md',
    'blocks/README.md',
    'blocks/core',
    'blocks/domains/ui.md',
    'blocks/contexts/platforms/browser.md',
    'README.md',
  ])(
    'should return nothing for %p when it lies outside every block folder',
    (path) => {
      // Arrange
      const input = path;

      // Act
      const classified = classifyBlockPath(input);

      // Assert
      expect(classified).toBeUndefined();
    },
  );
});
