import { describe, expect, it } from 'bun:test';

import fc from 'fast-check';

import { EntryTarget, FileFormat, TargetKind } from '../entry-target.value-object';
import { FactKind, FactName } from '../fact.value-object';

// Keys of the pieces an entry's key is made of, its format marks and guards among them, and keys of
// any text.
const entryKeys = fc.oneof(
  fc
    .array(
      fc.constantFrom(
        'biome.json',
        '${role.source}/',
        '${constitution.run}',
        ' !jsonc',
        ' !yaml',
        ' ? ',
        '!',
        '${workspace.members}',
        '${gone',
        ' = ',
        'a b',
        ' ',
      ),
      {
        maxLength: 8,
      },
    )
    .map((pieces) => pieces.join('')),
  fc.string(),
);

// The invariant: every key names a target, and the target's text opens the key.
const opensItsKey = (key: string): boolean =>
  key.startsWith(EntryTarget.textOf(EntryTarget.of(key)));

describe('EntryTarget', () => {
  it.each([
    {
      condition: 'it names a file alone',
      target: {
        kind: TargetKind.File,
        writtenPath: 'bunfig.toml',
      },
      key: 'bunfig.toml',
    },
    {
      condition: 'a fact guards it',
      target: {
        guard: {
          fact: {
            kind: FactKind.Named,
            name: FactName.FileIsTop,
          },
          isNegated: false,
        },
        kind: TargetKind.File,
        writtenPath: 'bunfig.toml',
      },
      key: 'bunfig.toml ? ${file.isTop}',
    },
    {
      condition: "a fact's negation guards it",
      target: {
        guard: {
          fact: {
            kind: FactKind.Named,
            name: FactName.WorkspaceIsRoot,
          },
          isNegated: true,
        },
        kind: TargetKind.File,
        writtenPath: 'pyproject.toml',
      },
      key: 'pyproject.toml ? !${workspace.isRoot}',
    },
    {
      condition: 'spaces stand around its question mark',
      target: {
        guard: {
          fact: {
            kind: FactKind.Named,
            name: FactName.FileIsTop,
          },
          isNegated: false,
        },
        kind: TargetKind.File,
        writtenPath: 'bunfig.toml',
      },
      key: 'bunfig.toml  ?  ${file.isTop}',
    },
    {
      condition: 'more text follows its fact',
      target: {
        kind: TargetKind.File,
        writtenPath: 'notes ? ${file.isTop} later',
      },
      key: 'notes ? ${file.isTop} later',
    },
    {
      condition: 'what follows its question mark names no fact',
      target: {
        kind: TargetKind.File,
        writtenPath: 'notes ? ${home}',
      },
      key: 'notes ? ${home}',
    },
    {
      condition: 'a mark names its format',
      target: {
        format: FileFormat.Jsonc,
        kind: TargetKind.File,
        writtenPath: 'tsconfig.json',
      },
      key: 'tsconfig.json !jsonc',
    },
    {
      condition: 'a mark names no format constitution knows',
      target: {
        kind: TargetKind.File,
        writtenPath: 'notes.json !yaml',
      },
      key: 'notes.json !yaml',
    },
    {
      condition: 'a mark and a guard follow its path',
      target: {
        format: FileFormat.Jsonc,
        guard: {
          fact: {
            kind: FactKind.Named,
            name: FactName.FileIsTop,
          },
          isNegated: false,
        },
        kind: TargetKind.File,
        writtenPath: 'tsconfig.json',
      },
      key: 'tsconfig.json !jsonc ? ${file.isTop}',
    },
    {
      condition: 'its guard compares a fact with a text',
      target: {
        guard: {
          equals: '${role.deployed-unit}',
          fact: {
            kind: FactKind.Named,
            name: FactName.UnitParent,
          },
          isNegated: true,
        },
        kind: TargetKind.File,
        writtenPath: '.dependency-cruiser.jsonc',
      },
      key: '.dependency-cruiser.jsonc ? !${unit.parent} = ${role.deployed-unit}',
    },
    {
      condition: 'spaces stand around its mark and its equals sign',
      target: {
        format: FileFormat.Jsonc,
        guard: {
          equals: 'apps',
          fact: {
            kind: FactKind.Named,
            name: FactName.UnitParent,
          },
          isNegated: false,
        },
        kind: TargetKind.File,
        writtenPath: 'tsconfig.json',
      },
      key: 'tsconfig.json  !jsonc ? ${unit.parent}  =  apps',
    },
    {
      condition: 'more text follows its mark',
      target: {
        kind: TargetKind.File,
        writtenPath: 'tsconfig.json !jsonc later',
      },
      key: 'tsconfig.json !jsonc later',
    },
    {
      condition: 'it names the run',
      key: '${constitution.run}',
      target: {
        kind: TargetKind.Run,
      },
    },
    {
      condition: 'a fact guards the run',
      key: '${constitution.run} ? ${file.isTop}',
      target: {
        guard: {
          fact: {
            kind: FactKind.Named,
            name: FactName.FileIsTop,
          },
          isNegated: false,
        },
        kind: TargetKind.Run,
      },
    },
    {
      condition: "a format's mark follows the run's key",
      key: '${constitution.run} !jsonc',
      target: {
        format: FileFormat.Jsonc,
        kind: TargetKind.File,
        writtenPath: '${constitution.run}',
      },
    },
  ])('should read the target and its guard when $condition', ({ key, target }) => {
    // Act
    const read = EntryTarget.of(key);

    // Assert
    expect(read).toStrictEqual(target);
  });

  it.each([
    {
      condition: 'it lies below its folder',
      writtenPath: 'src/__tests__/sandbox.fixtures.ts',
      isInUnit: true,
    },
    {
      condition: 'it starts at the root of the file system',
      writtenPath: '/biome.json',
      isInUnit: false,
    },
    {
      condition: 'it climbs out of its folder',
      writtenPath: 'src/../../biome.json',
      isInUnit: false,
    },
    {
      condition: 'it climbs, though back into its folder',
      writtenPath: 'src/../biome.json',
      isInUnit: false,
    },
  ])(
    "should tell whether a file stays in its unit's folder when $condition",
    ({ isInUnit, writtenPath }) => {
      // Act
      const isInside = EntryTarget.staysInItsUnit({
        kind: TargetKind.File,
        writtenPath,
      });

      // Assert
      expect(isInside).toBe(isInUnit);
    },
  );

  it('should read any key as a target whose text opens the key', () => {
    // Act
    const run = fc.check(fc.property(entryKeys, opensItsKey));

    // Assert
    expect(run.counterexample).toBeNull();
  });
});
