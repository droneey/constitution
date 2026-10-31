import { describe, expect, it } from 'bun:test';

import { projectPlace } from '#/__tests__/project-place.fixtures';
import { Level } from '#/kernel/constants';
import type { Lowering, ProjectPlace } from '#/kernel/entities';
import { AbsolutePath, RuleSlug, UnitPath } from '#/kernel/value-objects';

import { createFakeActiveRulesSource } from '../../../../../../__tests__/active-rules-source.fake';
import {
  activeRulesOf,
  coreChapter,
  testHasher,
  typescriptPassport,
  uiPassport,
} from '../../../../../../__tests__/gate.fixtures';
import { createFakeWorkingTree } from '../../../../../../__tests__/working-tree.fake';
import type { ActiveRead, ActiveRulesSource, WorkingTree } from '../../../../../contracts';
import { ActiveReadStatus } from '../../../../../contracts';
import type { GateCause, GatedRule, GateTarget } from '../../../../../entities';
import { GateCauseKind, TargetKind } from '../../../../../entities';
import { RuleHash } from '../../../../../value-objects';
import type { TargetRules } from '../owe-rules';
import { rulesOwedBy } from '../owe-rules';

const slug = RuleSlug.create('name-reveals-more');
const tightened = RuleSlug.create('name-reveals-intent');
const projectFolder: GateTarget = {
  kind: TargetKind.Folder,
  path: AbsolutePath.create('/work/project'),
};
const sourceFile: GateTarget = {
  kind: TargetKind.File,
  path: AbsolutePath.create('/work/project/src/a.ts'),
};

const oweOf = (input: {
  source: ActiveRulesSource;
  target?: GateTarget;
  workingTree?: WorkingTree;
}): TargetRules =>
  rulesOwedBy({
    hasher: testHasher,
    source: input.source,
    workingTree: input.workingTree ?? createFakeWorkingTree(),
  })(input.target ?? projectFolder);

const sourceWithLowerings = (lowerings: readonly Lowering[]): ActiveRulesSource =>
  createFakeActiveRulesSource({
    active: {
      rules: activeRulesOf({
        lowerings: new Map([
          [
            slug,
            lowerings,
          ],
        ]),
      }),
      status: ActiveReadStatus.Read,
    },
    files: {
      [coreChapter]: [
        {
          slug,
          statement: 'A name says more.',
          why: 'More is clearer.',
        },
      ],
      [uiPassport]: [],
    },
  });

const notingReadsOf = (
  source: ActiveRulesSource,
): {
  readonly releases: string[];
  readonly ruleFiles: string[];
  readonly source: ActiveRulesSource;
} => {
  const releases: string[] = [];
  const ruleFiles: string[] = [];

  return {
    releases,
    ruleFiles,
    source: {
      ...source,
      readActive: (place: ProjectPlace) => {
        releases.push(place.releaseFolderPath);

        return source.readActive(place);
      },
      rulesIn: (file: AbsolutePath) => {
        ruleFiles.push(file);

        return source.rulesIn(file);
      },
    },
  };
};

const findingProjectFrom = (folder: string): ActiveRulesSource => ({
  ...createFakeActiveRulesSource(),
  findProjectAround: (searchFrom) => (searchFrom === folder ? projectPlace : undefined),
});

describe('rulesOwedBy', () => {
  it('should give a rule of the project folder at its declared level, lowered as its unit lowers it through an arrow', () => {
    // Arrange
    const source = createFakeActiveRulesSource({
      active: {
        rules: activeRulesOf({
          levels: new Map([
            [
              slug,
              Level.Should,
            ],
          ]),
          lowerings: new Map([
            [
              slug,
              [
                {
                  level: Level.May,
                  reason: 'generated names',
                  unit: UnitPath.create(''),
                  via: tightened,
                },
              ],
            ],
          ]),
        }),
        status: ActiveReadStatus.Read,
      },
      files: {
        [coreChapter]: [
          {
            slug,
            statement: 'A name says more.',
            tightens: tightened,
            why: 'More is clearer.',
          },
        ],
        [uiPassport]: [],
      },
    });

    // Act
    const owed = oweOf({
      source,
    });

    // Assert
    expect(owed.project?.rules).toStrictEqual([
      {
        file: AbsolutePath.create(coreChapter),
        hash: RuleHash.create('fa77ac89fc6eec28'),
        level: Level.Should,
        lowered: {
          level: Level.May,
          reason: 'generated names',
          via: tightened,
        },
        slug,
        statement: 'A name says more.',
        tightens: tightened,
        why: 'More is clearer.',
      },
    ]);
  });

  it.each<{
    condition: string;
    expected: GatedRule;
    lowerings: readonly Lowering[];
  }>([
    {
      condition: 'no override lowers it and it tightens no rule',
      expected: {
        file: AbsolutePath.create(coreChapter),
        hash: RuleHash.create('b8c9a0f3073789e9'),
        level: Level.Must,
        slug,
        statement: 'A name says more.',
        why: 'More is clearer.',
      },
      lowerings: [],
    },
    {
      condition: 'its unit lowers it directly',
      expected: {
        file: AbsolutePath.create(coreChapter),
        hash: RuleHash.create('9b46a4a70b32b970'),
        level: Level.Must,
        lowered: {
          level: Level.May,
          reason: 'generated names',
        },
        slug,
        statement: 'A name says more.',
        why: 'More is clearer.',
      },
      lowerings: [
        {
          level: Level.May,
          reason: 'generated names',
          unit: UnitPath.create(''),
        },
      ],
    },
    {
      condition: 'another unit lowers it',
      expected: {
        file: AbsolutePath.create(coreChapter),
        hash: RuleHash.create('b8c9a0f3073789e9'),
        level: Level.Must,
        slug,
        statement: 'A name says more.',
        why: 'More is clearer.',
      },
      lowerings: [
        {
          level: Level.May,
          reason: 'generated names',
          unit: UnitPath.create('web'),
        },
      ],
    },
  ])(
    'should give a rule with only the fields that hold when $condition',
    ({ expected, lowerings }) => {
      // Act
      const owed = oweOf({
        source: sourceWithLowerings(lowerings),
      });

      // Assert
      expect(owed.project?.rules).toStrictEqual([
        expected,
      ]);
    },
  );

  it.each<{
    causes: readonly GateCause[];
    condition: string;
    source: ActiveRulesSource;
    workingTree: WorkingTree;
  }>([
    {
      causes: [
        {
          file: AbsolutePath.create(coreChapter),
          kind: GateCauseKind.Unreadable,
        },
        {
          file: AbsolutePath.create(uiPassport),
          kind: GateCauseKind.Unreadable,
        },
      ],
      condition: 'two rule files cannot be read',
      source: createFakeActiveRulesSource({
        files: {},
      }),
      workingTree: createFakeWorkingTree(),
    },
    {
      causes: [
        {
          config: AbsolutePath.create('/work/project/constitution.yaml'),
          kind: GateCauseKind.Unparsed,
          lines: [
            3,
          ],
        },
      ],
      condition: 'constitution.yaml does not parse',
      source: createFakeActiveRulesSource({
        active: {
          lines: [
            3,
          ],
          status: ActiveReadStatus.Unparsed,
        },
      }),
      workingTree: createFakeWorkingTree(),
    },
    {
      causes: [
        {
          kind: GateCauseKind.Failed,
          reason: 'the release cannot be listed',
        },
      ],
      condition: "the project's rules cannot be read",
      source: createFakeActiveRulesSource({
        active: {
          reason: 'the release cannot be listed',
          status: ActiveReadStatus.Failed,
        },
      }),
      workingTree: createFakeWorkingTree(),
    },
    {
      causes: [
        {
          kind: GateCauseKind.NoRelease,
          releaseFolderPath: projectPlace.releaseFolderPath,
        },
      ],
      condition: 'no release is installed and git names no main checkout',
      source: createFakeActiveRulesSource({
        active: {
          status: ActiveReadStatus.NoRelease,
        },
      }),
      workingTree: createFakeWorkingTree({
        repositoryFolderPath: '/work/elsewhere',
      }),
    },
  ])('should owe no rule and name why when $condition', ({ causes, source, workingTree }) => {
    // Act
    const owed = oweOf({
      source,
      workingTree,
    });

    // Assert
    expect({
      causes: owed.causes,
      rules: owed.project?.rules,
    }).toStrictEqual({
      causes,
      rules: [],
    });
  });

  it('should read the release of the main checkout when a worktree has none of its own', () => {
    // Arrange
    const source = createFakeActiveRulesSource({
      active: {
        status: ActiveReadStatus.NoRelease,
      },
      activeByRelease: {
        '/work/main/.droneey/constitution': {
          rules: activeRulesOf(),
          status: ActiveReadStatus.Read,
        },
      },
    });

    // Act
    const owed = oweOf({
      source,
      workingTree: createFakeWorkingTree({
        mainCheckout: '/work/main',
      }),
    });

    // Assert
    expect(owed.project?.rules.map((rule) => rule.hash)).toStrictEqual([
      RuleHash.create('ae5e35970b775168'),
      RuleHash.create('8fecb23fc9a9dd01'),
    ]);
  });

  it.each<{
    active: ActiveRead;
    condition: string;
    mainCheckout: string;
    releases: readonly string[];
  }>([
    {
      active: {
        rules: activeRulesOf(),
        status: ActiveReadStatus.Read,
      },
      condition: 'the release of the project was read',
      mainCheckout: '/work/main',
      releases: [
        '/work/project/.droneey/constitution',
      ],
    },
    {
      active: {
        status: ActiveReadStatus.NoRelease,
      },
      condition: 'the project is the main checkout',
      mainCheckout: '/work/project',
      releases: [
        '/work/project/.droneey/constitution',
      ],
    },
    {
      active: {
        status: ActiveReadStatus.NoRelease,
      },
      condition: 'a worktree has no release of its own',
      mainCheckout: '/work/main',
      releases: [
        '/work/project/.droneey/constitution',
        '/work/main/.droneey/constitution',
      ],
    },
  ])('should read the releases $releases when $condition', ({ active, mainCheckout, releases }) => {
    // Arrange
    const noted = notingReadsOf(
      createFakeActiveRulesSource({
        activeByRelease: {
          '/work/project/.droneey/constitution': active,
        },
      }),
    );

    // Act
    oweOf({
      source: noted.source,
      workingTree: createFakeWorkingTree({
        mainCheckout,
      }),
    });

    // Assert
    expect<readonly string[]>(noted.releases).toStrictEqual(releases);
  });

  it('should owe no rule of a project that does not hold the file', () => {
    // Arrange
    const source: ActiveRulesSource = {
      ...createFakeActiveRulesSource(),
      findProjectAround: () => projectPlace,
    };
    const target = {
      kind: TargetKind.File,
      path: AbsolutePath.create('/elsewhere/a.ts'),
    };

    // Act
    const owed = oweOf({
      source,
      target,
    });

    // Assert
    expect(owed).toStrictEqual({
      causes: [],
      project: {
        folderPath: projectPlace.repositoryFolderPath,
        rules: [],
      },
      realPath: AbsolutePath.create('/elsewhere/a.ts'),
    });
  });

  it.each([
    {
      condition: 'a file, from the folder it lies in',
      folder: '/work/project/src',
      target: sourceFile,
    },
    {
      condition: 'a folder, from the folder itself',
      folder: '/work/project',
      target: projectFolder,
    },
  ])('should look for the project of $condition', ({ folder, target }) => {
    // Act
    const owed = oweOf({
      source: findingProjectFrom(folder),
      target,
    });

    // Assert
    expect(owed.project?.folderPath).toBe(projectPlace.repositoryFolderPath);
  });

  it('should owe no rule of a file in no project', () => {
    // Arrange
    const target = {
      kind: TargetKind.File,
      path: AbsolutePath.create('/tmp/a.ts'),
    };

    // Act
    const owed = oweOf({
      source: createFakeActiveRulesSource(),
      target,
    });

    // Assert
    expect(owed).toStrictEqual({
      causes: [],
      realPath: AbsolutePath.create('/tmp/a.ts'),
    });
  });

  it('should read each rule file once for targets that share it', () => {
    // Arrange
    const noted = notingReadsOf(createFakeActiveRulesSource());
    const owedFor = rulesOwedBy({
      hasher: testHasher,
      source: noted.source,
      workingTree: createFakeWorkingTree(),
    });

    owedFor(sourceFile);

    // Act
    owedFor({
      kind: TargetKind.File,
      path: AbsolutePath.create('/work/project/src/b.ts'),
    });

    // Assert
    expect<readonly string[]>(noted.ruleFiles).toStrictEqual([
      coreChapter,
      uiPassport,
      typescriptPassport,
    ]);
  });

  it('should read the release of a project once for targets in two of its folders', () => {
    // Arrange
    const noted = notingReadsOf(createFakeActiveRulesSource());
    const owedFor = rulesOwedBy({
      hasher: testHasher,
      source: noted.source,
      workingTree: createFakeWorkingTree(),
    });

    owedFor(sourceFile);

    // Act
    owedFor({
      kind: TargetKind.File,
      path: AbsolutePath.create('/work/project/tests/a.test.ts'),
    });

    // Assert
    expect<readonly string[]>(noted.releases).toStrictEqual([
      '/work/project/.droneey/constitution',
    ]);
  });

  it('should read the release of each project its targets lie in', () => {
    // Arrange
    const places: Readonly<Record<string, ProjectPlace>> = {
      '/work/other/src': {
        releaseFolderPath: AbsolutePath.create('/work/other/.droneey/constitution'),
        repositoryFolderPath: AbsolutePath.create('/work/other'),
      },
      '/work/project/src': projectPlace,
    };
    const noted = notingReadsOf({
      ...createFakeActiveRulesSource(),
      findProjectAround: (searchFrom) => places[searchFrom],
    });
    const owedFor = rulesOwedBy({
      hasher: testHasher,
      source: noted.source,
      workingTree: createFakeWorkingTree(),
    });

    owedFor(sourceFile);

    // Act
    owedFor({
      kind: TargetKind.File,
      path: AbsolutePath.create('/work/other/src/a.ts'),
    });

    // Assert
    expect<readonly string[]>(noted.releases).toStrictEqual([
      '/work/project/.droneey/constitution',
      '/work/other/.droneey/constitution',
    ]);
  });
});
