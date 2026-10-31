import { describe, expect, it } from 'bun:test';

import { Level } from '#/kernel/constants';
import { RepositoryRelativePath, RuleSlug, SourceKind, UnitPath } from '#/kernel/value-objects';

import { activeRulesOf } from '../../../__tests__/gate.fixtures';
import { activeBlockOf } from '../../../__tests__/session.fixtures';
import { ActiveRules } from '../active-rules.entity';
import { TargetKind } from '../gate-target.entity';

const RELEASE = '/work/project/.droneey/constitution';

describe('ActiveRules.ruleFilesOf', () => {
  it.each([
    {
      condition: 'a file of the repository its globs match',
      files: [
        `${RELEASE}/blocks/core/foundation/names.md`,
        `${RELEASE}/blocks/domains/ui/ui.md`,
        `${RELEASE}/blocks/contexts/languages/typescript/typescript.md`,
      ],
      kind: TargetKind.File,
      path: 'src/a.ts',
    },
    {
      condition: 'a folder, which only core and the blocks of every file govern',
      files: [
        `${RELEASE}/blocks/core/foundation/names.md`,
        `${RELEASE}/blocks/domains/ui/ui.md`,
      ],
      kind: TargetKind.Folder,
      path: 'src',
    },
    {
      condition:
        'a folder named as the globs of a block name its files, which still only core and the blocks of every file govern',
      files: [
        `${RELEASE}/blocks/core/foundation/names.md`,
        `${RELEASE}/blocks/domains/ui/ui.md`,
      ],
      kind: TargetKind.Folder,
      path: 'src/types.ts',
    },
    {
      condition: 'a file of a member, which its own blocks govern',
      files: [
        `${RELEASE}/blocks/core/foundation/names.md`,
        `${RELEASE}/blocks/domains/ui/ui.md`,
      ],
      kind: TargetKind.File,
      path: 'web/src/a.ts',
    },
  ])('should give the rule files of $condition', ({ files, kind, path }) => {
    // Act
    const given = ActiveRules.ruleFilesOf(activeRulesOf(), {
      kind,
      path: RepositoryRelativePath.create(path),
    });

    // Assert
    expect<readonly string[]>(given).toStrictEqual(files);
  });

  it("should name a pack's file from the repository when the pack's folder is named blocks", () => {
    // Arrange
    const rules = {
      ...activeRulesOf(),
      active: [
        activeBlockOf({
          files: [
            'blocks/domains/acme/acme.md',
          ],
          id: 'acme',
          source: SourceKind.Pack,
        }),
      ],
      core: [],
    };

    // Act
    const given = ActiveRules.ruleFilesOf(rules, {
      kind: TargetKind.File,
      path: RepositoryRelativePath.create('a.ts'),
    });

    // Assert
    expect<readonly string[]>(given).toStrictEqual([
      '/work/project/blocks/domains/acme/acme.md',
    ]);
  });

  it('should give the files of a block that governs every file among other globs to a folder', () => {
    // Arrange
    const rules = {
      ...activeRulesOf(),
      active: [
        activeBlockOf({
          governs: [
            '**/*.md',
            '**',
          ],
          id: 'acme',
        }),
      ],
      core: [],
    };

    // Act
    const given = ActiveRules.ruleFilesOf(rules, {
      kind: TargetKind.Folder,
      path: RepositoryRelativePath.create('src'),
    });

    // Assert
    expect<readonly string[]>(given).toStrictEqual([
      '/work/project/.droneey/constitution/blocks/domains/acme/acme.md',
    ]);
  });
});

describe('ActiveRules.loweringOf', () => {
  const slug = RuleSlug.create('name-reveals-intent');
  const web = UnitPath.create('web');
  const direct = {
    level: Level.May,
    reason: 'generated names',
    unit: web,
  } as const;
  const through = {
    ...direct,
    level: Level.Should,
    via: RuleSlug.create('name-from-the-glossary'),
  } as const;
  const rules = activeRulesOf({
    lowerings: new Map([
      [
        slug,
        [
          through,
          direct,
        ],
      ],
    ]),
  });

  it.each([
    {
      condition: 'the unit lowers it directly and through an arrow',
      lowering: direct,
      slug,
      unit: web,
    },
    {
      condition: 'another unit lowers it',
      lowering: undefined,
      slug,
      unit: UnitPath.create(''),
    },
    {
      condition: 'no override lowers it',
      lowering: undefined,
      slug: RuleSlug.create('function-does-one-thing'),
      unit: web,
    },
  ])('should give the lowering that applies when $condition', ({ lowering, slug: asked, unit }) => {
    // Act
    const given = ActiveRules.loweringOf(rules, {
      slug: asked,
      unit,
    });

    // Assert
    expect(given).toStrictEqual(lowering);
  });
});
