import { describe, expect, it } from 'bun:test';

import { FactKind, FactName } from '../fact.value-object';
import { TargetFile } from '../target-file.value-object';

describe('TargetFile', () => {
  it.each([
    {
      condition: 'it names a file alone',
      file: {
        path: 'bunfig.toml',
      },
      key: 'bunfig.toml',
    },
    {
      condition: 'a fact guards it',
      file: {
        guard: {
          fact: {
            kind: FactKind.Named,
            name: FactName.FileIsTop,
          },
          isNegated: false,
        },
        path: 'bunfig.toml',
      },
      key: 'bunfig.toml ? ${file.isTop}',
    },
    {
      condition: "a fact's negation guards it",
      file: {
        guard: {
          fact: {
            kind: FactKind.Named,
            name: FactName.WorkspaceIsRoot,
          },
          isNegated: true,
        },
        path: 'pyproject.toml',
      },
      key: 'pyproject.toml ? !${workspace.isRoot}',
    },
    {
      condition: 'spaces stand around its question mark',
      file: {
        guard: {
          fact: {
            kind: FactKind.Named,
            name: FactName.FileIsTop,
          },
          isNegated: false,
        },
        path: 'bunfig.toml',
      },
      key: 'bunfig.toml  ?  ${file.isTop}',
    },
    {
      condition: 'more text follows its fact',
      file: {
        path: 'notes ? ${file.isTop} later',
      },
      key: 'notes ? ${file.isTop} later',
    },
    {
      condition: 'what follows its question mark names no fact',
      file: {
        path: 'notes ? ${home}',
      },
      key: 'notes ? ${home}',
    },
  ])('should read the file and its guard when $condition', ({ file, key }) => {
    // Act
    const read = TargetFile.of(key);

    // Assert
    expect(read).toStrictEqual(file);
  });

  it.each([
    {
      condition: 'it lies below its folder',
      path: 'src/__tests__/sandbox.fixtures.ts',
      stays: true,
    },
    {
      condition: 'it starts at the root of the file system',
      path: '/biome.json',
      stays: false,
    },
    {
      condition: 'it climbs out of its folder',
      path: 'src/../../biome.json',
      stays: false,
    },
  ])("should tell whether a file stays in its unit's folder when $condition", ({ path, stays }) => {
    // Act
    const isInside = TargetFile.staysInItsUnit({
      path,
    });

    // Assert
    expect(isInside).toBe(stays);
  });
});
