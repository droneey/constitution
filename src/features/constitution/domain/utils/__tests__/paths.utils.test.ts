import { describe, expect, it } from 'bun:test';

import {
  directoryOf,
  fileNameOf,
  joinPaths,
  normalizePath,
  stemOf,
} from '../paths.utils';

describe('paths', () => {
  it.each([
    {
      condition: 'the path has folders',
      expected: 'blocks/core/architecture',
      path: 'blocks/core/architecture/code.md',
    },
    {
      condition: 'the path is a file at the root',
      expected: '.',
      path: 'constitution.yaml',
    },
  ])('should give the folder when $condition', ({ expected, path }) => {
    // Arrange
    const input = path;

    // Act
    const folder = directoryOf(input);

    // Assert
    expect(folder).toBe(expected);
  });

  it.each([
    {
      condition: 'the path has folders',
      expected: 'code.md',
      path: 'blocks/core/architecture/code.md',
    },
    {
      condition: 'the path is a file at the root',
      expected: 'constitution.yaml',
      path: 'constitution.yaml',
    },
  ])('should give the file name when $condition', ({ expected, path }) => {
    // Arrange
    const input = path;

    // Act
    const name = fileNameOf(input);

    // Assert
    expect(name).toBe(expected);
  });

  it.each([
    {
      condition: 'the name ends in the extension',
      expected: 'forms',
      path: 'blocks/domains/ui/foundation/forms.md',
    },
    {
      condition: 'the name ends in another extension',
      expected: 'forms.yaml',
      path: 'blocks/domains/ui/foundation/forms.yaml',
    },
  ])('should give the stem when $condition', ({ expected, path }) => {
    // Arrange
    const input = {
      extension: '.md',
      path,
    };

    // Act
    const stem = stemOf(input);

    // Assert
    expect(stem).toBe(expected);
  });

  it.each([
    {
      condition: 'a segment is "."',
      expected: 'blocks/core',
      path: 'blocks/./core',
    },
    {
      condition: 'a segment is empty',
      expected: 'blocks/core',
      path: 'blocks//core',
    },
    {
      condition: 'a ".." takes back the segment before it',
      expected: 'blocks/domains',
      path: 'blocks/core/../domains',
    },
    {
      condition: 'a ".." has nothing to take back',
      expected: '../blocks',
      path: '../blocks',
    },
    {
      condition: 'a ".." follows another',
      expected: '../../blocks',
      path: '../../blocks',
    },
    {
      condition: 'the path starts at the repository root',
      expected: 'blocks/core',
      path: '/blocks/core',
    },
    {
      condition: 'the path is a folder',
      expected: 'blocks/core/',
      path: 'blocks/core/',
    },
    {
      condition: 'nothing is left',
      expected: '.',
      path: 'blocks/..',
    },
    {
      condition: 'nothing is left of a folder',
      expected: '.',
      path: './',
    },
  ])('should normalise the path when $condition', ({ expected, path }) => {
    // Arrange
    const input = path;

    // Act
    const normalised = normalizePath(input);

    // Assert
    expect(normalised).toBe(expected);
  });

  it('should join and normalise the paths when a link leaves its folder', () => {
    // Arrange
    const paths = [
      'blocks/core',
      '../domains/ui/ui.md',
    ];

    // Act
    const joined = joinPaths(paths);

    // Assert
    expect(joined).toBe('blocks/domains/ui/ui.md');
  });
});
