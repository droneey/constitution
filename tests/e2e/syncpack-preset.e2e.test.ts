import { describe, expect, it } from 'bun:test';

import self from '../../presets/typescript/syncpack/foundation/self.mjs';
import { versionIssues } from './syncpack-preset.fixtures';

describe('the syncpack typescript part', () => {
  it.each([
    {
      condition: 'a tool takes a caret range',
      manifest: {
        devDependencies: {
          tool: '^1.0.0',
        },
        name: 'a',
        version: '1.0.0',
      },
    },
    {
      condition: 'a dependency of the program is pinned exactly',
      manifest: {
        dependencies: {
          library: '1.0.0',
        },
        name: 'a',
        version: '1.0.0',
      },
    },
  ])('should report SemverRangeMismatch when $condition', ({ manifest }) => {
    // Arrange
    const repository = [
      manifest,
    ];

    // Act
    const found = versionIssues(repository);

    // Assert
    expect(found).toStrictEqual([
      'SemverRangeMismatch',
    ]);
  });

  it("should report nothing when the tools are pinned exactly and the program's dependencies take caret ranges", () => {
    // Arrange
    const repository = [
      {
        dependencies: {
          library: '^1.0.0',
        },
        devDependencies: {
          tool: '1.0.0',
        },
        name: 'a',
        version: '1.0.0',
      },
    ];

    // Act
    const found = versionIssues(repository);

    // Assert
    expect(found).toStrictEqual([]);
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

describe('the syncpack parts of a workspace', () => {
  it("should report DiffersToPin when a unit takes the repository's own unit from the registry", () => {
    // Arrange
    const repository = [
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
    ];

    // Act
    const found = versionIssues(repository);

    // Assert
    expect(found).toContain('DiffersToPin');
  });

  it('should report nothing when the units link each other and keep wide peer ranges', () => {
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
