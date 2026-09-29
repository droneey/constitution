import { describe, expect, it } from 'bun:test';

import self from '../../presets/syncpack/foundation/self.mjs';
import typescript from '../../presets/syncpack/foundation/typescript.mjs';
import { versionIssues } from './syncpack-preset.fixtures';

describe('the syncpack typescript part', () => {
  it('should put the identity of a package first and its dependencies last when a manifest is formatted', () => {
    // Arrange
    const identity = [
      'name',
      'version',
      'private',
    ];
    const dependencies = [
      'dependencies',
      'devDependencies',
      'peerDependencies',
      'peerDependenciesMeta',
    ];

    // Act
    const order = typescript.sortFirst;

    // Assert
    expect({
      first: order.slice(0, identity.length),
      last: order.slice(-dependencies.length),
    }).toStrictEqual({
      first: identity,
      last: dependencies,
    });
  });

  it('should ask for caret ranges on the project dependencies only when the versions are linted', () => {
    // Arrange
    const caretRanges = {
      label: 'Use caret ranges for the dependencies of the project',
      range: '^',
      dependencyTypes: [
        'dev',
        'prod',
      ],
    };

    // Act
    const groups = typescript.semverGroups;

    // Assert
    expect(groups).toStrictEqual([
      caretRanges,
    ]);
  });
});

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
      condition:
        "a package takes the repository's own package from the registry",
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
