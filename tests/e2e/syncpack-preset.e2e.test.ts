import { describe, expect, it } from 'bun:test';

import self from '../../presets/typescript/syncpack/foundation/self.mjs';
import { versionIssues } from './syncpack-preset.fixtures';

describe('the syncpack self part', () => {
  it('should leave the scripts in the order the author chose when a manifest is formatted', () => {
    // Arrange
    const field = 'scripts';

    // Act
    const sorted = self.sortAz;

    // Assert
    expect(sorted).not.toContain(field);
  });
});

describe('the syncpack parts of a repository of packages', () => {
  it.each([
    {
      condition: 'two packages are at different versions',
      packages: [
        {
          name: 'a',
          version: '1.0.0',
        },
        {
          name: 'b',
          version: '1.1.0',
        },
      ],
      reported: 'SameRangeMismatch',
    },
    {
      condition: "a package takes the repository's own package from the registry",
      packages: [
        {
          name: 'a',
          version: '1.0.0',
        },
        {
          devDependencies: {
            a: '^1.0.0',
          },
          name: 'b',
          version: '1.0.0',
        },
      ],
      reported: 'DiffersToPin',
    },
  ])('should report $reported when $condition', ({ packages, reported }) => {
    // Arrange
    const repository = packages;

    // Act
    const found = versionIssues(repository);

    // Assert
    expect(found).toContain(reported);
  });

  it('should report nothing when the packages share a version, link each other and keep wide peer ranges', () => {
    // Arrange
    const repository = [
      {
        name: 'a',
        version: '1.0.0',
      },
      {
        devDependencies: {
          a: 'workspace:*',
        },
        name: 'b',
        peerDependencies: {
          a: '>=1.0.0',
        },
        version: '1.0.0',
      },
    ];

    // Act
    const found = versionIssues(repository);

    // Assert
    expect(found).toStrictEqual([]);
  });
});
