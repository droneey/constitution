import { describe, expect, it } from 'bun:test';

import { Level } from '#/kernel/constants';
import type { ProjectPlace } from '#/kernel/entities';
import { AbsolutePath, RuleSlug, UnitPath } from '#/kernel/value-objects';

import { createFakeActiveRulesSource } from '../../../../../__tests__/active-rules-source.fake';
import {
  activeRulesOf,
  coreChapter,
  defaultFiles,
  testHasher,
  uiPassport,
  wordingOf,
} from '../../../../../__tests__/gate.fixtures';
import { createFakeGateRepository } from '../../../../../__tests__/gate-command-repository.fake';
import { keptSession } from '../../../../../__tests__/session.fixtures';
import { createFakeWorkingTree } from '../../../../../__tests__/working-tree.fake';
import type {
  GateTarget,
  GateVerdict,
  ReadingCount,
  RuleDebt,
} from '../../../../../domain/gate/entities';
import {
  DebtKind,
  GateCauseKind,
  GateVerdictKind,
  TargetKind,
} from '../../../../../domain/gate/entities';
import type { SessionAgent } from '../../../../../domain/session/entities';
import { SessionAgent as Agents } from '../../../../../domain/session/entities';
import { AgentId } from '../../../../../domain/session/value-objects';
import type { ActiveRulesSource, WorkingTree } from '../../../../contracts';
import { ActiveReadStatus } from '../../../../contracts';
import type { GateRepository } from '../../../../contracts/repositories/commands';
import { gateAction } from '../gate-action.use-case';

const sourceFile: GateTarget = {
  kind: TargetKind.File,
  path: AbsolutePath.create('/work/project/src/a.ts'),
};
const webFile: GateTarget = {
  kind: TargetKind.File,
  path: AbsolutePath.create('/work/project/web/src/a.ts'),
};
const projectFolder: GateTarget = {
  kind: TargetKind.Folder,
  path: AbsolutePath.create('/work/project'),
};
const config = AbsolutePath.create('/work/project/constitution.yaml');
const subagent = AgentId.create('agent-1');
const noRelease = createFakeActiveRulesSource({
  active: {
    status: ActiveReadStatus.NoRelease,
  },
});
const unparsed = createFakeActiveRulesSource({
  active: {
    lines: [
      3,
    ],
    status: ActiveReadStatus.Unparsed,
  },
});
const otherPlace: ProjectPlace = {
  releaseFolderPath: AbsolutePath.create('/work/other/.droneey/constitution'),
  repositoryFolderPath: AbsolutePath.create('/work/other'),
};
const withOtherProject: ActiveRulesSource = {
  ...createFakeActiveRulesSource({
    activeByRelease: {
      [otherPlace.releaseFolderPath]: {
        status: ActiveReadStatus.NoRelease,
      },
    },
  }),
  findProjectHolding: (path: AbsolutePath): ProjectPlace | undefined =>
    path.startsWith('/work/other')
      ? otherPlace
      : createFakeActiveRulesSource().findProjectHolding(path),
};

const gateOf = (input: {
  agent?: SessionAgent;
  gateRepository: GateRepository;
  source?: ActiveRulesSource;
  targets?: readonly GateTarget[];
  workingTree?: WorkingTree;
}): GateVerdict =>
  gateAction({
    agent: input.agent ?? Agents.main,
    gateRepository: input.gateRepository,
    hasher: testHasher,
    session: keptSession,
    source: input.source ?? createFakeActiveRulesSource(),
    targets: input.targets ?? [
      sourceFile,
    ],
    workingTree: input.workingTree ?? createFakeWorkingTree(),
  });

const partsReadAfter = (input: {
  agent?: SessionAgent;
  gateRepository: GateRepository;
  verdict: GateVerdict;
}): void => {
  for (const path of input.verdict.kind === GateVerdictKind.Refused ? input.verdict.parts : []) {
    const part = input.gateRepository.partOf({
      path,
      session: keptSession,
    });

    input.gateRepository.addRulesRead({
      agent: input.agent ?? Agents.main,
      definitions: part?.definitions ?? [],
      rules: part?.rules ?? [],
      session: keptSession,
    });
  }
};

const readRulesOf = (input: { gateRepository: GateRepository; target: GateTarget }): void => {
  partsReadAfter({
    gateRepository: input.gateRepository,
    verdict: gateOf({
      gateRepository: input.gateRepository,
      targets: [
        input.target,
      ],
    }),
  });
};

const owedOf = (gateRepository: GateRepository, debts: readonly RuleDebt[]): void => {
  gateRepository.addDebts({
    agent: Agents.main,
    debts,
    session: keptSession,
  });
};

const refusedThrice = (input: {
  gateRepository: GateRepository;
  source: ActiveRulesSource;
}): void => {
  gateOf(input);
  gateOf(input);
  gateOf(input);
};

const unreadOf = (verdict: GateVerdict): number | undefined =>
  verdict.kind === GateVerdictKind.Refused || verdict.kind === GateVerdictKind.PassedUnread
    ? verdict.unread.rules
    : undefined;

const unreadReadingOf = (verdict: GateVerdict): ReadingCount | undefined =>
  verdict.kind === GateVerdictKind.Refused ? verdict.unread : undefined;

const changedOf = (verdict: GateVerdict): readonly AbsolutePath[] | undefined =>
  verdict.kind === GateVerdictKind.Refused ? verdict.changedByCommands : undefined;

const placedOf = (verdict: GateVerdict) =>
  verdict.kind === GateVerdictKind.Refused
    ? {
        shouldIgnoreParts: verdict.shouldIgnoreParts,
        isInProject: verdict.parts.every((part) =>
          part.startsWith('/work/project/.droneey/constitution-sessions/'),
        ),
      }
    : undefined;

describe('gateAction', () => {
  it.each([
    {
      condition: "an edit, until core's, every-file and the file's own rules are read",
      target: sourceFile,
      unread: 3,
    },
    {
      condition: "a command, until core's and the every-file rules are read",
      target: projectFolder,
      unread: 2,
    },
  ])('should refuse $condition', ({ target, unread }) => {
    // Arrange
    const gateRepository = createFakeGateRepository();

    // Act
    const verdict = gateOf({
      gateRepository,
      targets: [
        target,
      ],
    });

    // Assert
    expect(unreadOf(verdict)).toBe(unread);
  });

  it('should allow an edit of a file git ignores, owing no rule for it', () => {
    // Arrange
    const gateRepository = createFakeGateRepository();

    // Act
    const verdict = gateOf({
      gateRepository,
      targets: [
        {
          kind: TargetKind.File,
          path: AbsolutePath.create('/work/project/build/out.js'),
        },
      ],
      workingTree: createFakeWorkingTree({
        ignored: [
          'build',
        ],
      }),
    });

    // Assert
    expect(verdict).toStrictEqual({
      kind: GateVerdictKind.Allowed,
    });
  });

  it('should refuse a command run in a folder git ignores until its rules are read', () => {
    // Arrange
    const gateRepository = createFakeGateRepository();

    // Act
    const verdict = gateOf({
      gateRepository,
      targets: [
        {
          kind: TargetKind.Folder,
          path: AbsolutePath.create('/work/project/build'),
        },
      ],
      workingTree: createFakeWorkingTree({
        ignored: [
          'build',
        ],
      }),
    });

    // Assert
    expect(verdict.kind).toBe(GateVerdictKind.Refused);
  });

  it('should allow an edit once the rules its parts name are read', () => {
    // Arrange
    const gateRepository = createFakeGateRepository();

    readRulesOf({
      gateRepository,
      target: sourceFile,
    });

    // Act
    const verdict = gateOf({
      gateRepository,
    });

    // Assert
    expect(verdict).toStrictEqual({
      kind: GateVerdictKind.Allowed,
    });
  });

  it('should ask a subagent for the rules though the session read them', () => {
    // Arrange
    const gateRepository = createFakeGateRepository();

    readRulesOf({
      gateRepository,
      target: sourceFile,
    });

    // Act
    const verdict = gateOf({
      agent: subagent,
      gateRepository,
    });

    // Assert
    expect(unreadOf(verdict)).toBe(3);
  });

  it.each<{
    condition: string;
    source: ActiveRulesSource;
  }>([
    {
      condition: 'the one rule whose wording changed since it was read',
      source: createFakeActiveRulesSource({
        files: {
          ...defaultFiles,
          [uiPassport]: [
            wordingOf('four-data-states', 'Every screen shows four states.'),
          ],
        },
      }),
    },
    {
      condition: 'the rule an override starts to lower where the file lies',
      source: createFakeActiveRulesSource({
        active: {
          rules: activeRulesOf({
            lowerings: new Map([
              [
                RuleSlug.create('name-reveals-intent'),
                [
                  {
                    level: Level.May,
                    reason: 'generated names',
                    unit: UnitPath.create(''),
                  },
                ],
              ],
            ]),
          }),
          status: ActiveReadStatus.Read,
        },
      }),
    },
  ])('should ask again for $condition', ({ source }) => {
    // Arrange
    const gateRepository = createFakeGateRepository();

    readRulesOf({
      gateRepository,
      target: sourceFile,
    });

    // Act
    const verdict = gateOf({
      gateRepository,
      source,
    });

    // Assert
    expect(unreadOf(verdict)).toBe(1);
  });

  it('should ask for nothing again when only the Why of a rule changed since it was read', () => {
    // Arrange
    const gateRepository = createFakeGateRepository();

    readRulesOf({
      gateRepository,
      target: sourceFile,
    });

    // Act
    const verdict = gateOf({
      gateRepository,
      source: createFakeActiveRulesSource({
        files: {
          ...defaultFiles,
          [uiPassport]: [
            {
              ...wordingOf('four-data-states'),
              why: 'A screen in no state leaves its user guessing.',
            },
          ],
        },
      }),
    });

    // Assert
    expect(verdict).toStrictEqual({
      kind: GateVerdictKind.Allowed,
    });
  });

  it('should refuse an edit until the definitions of its chapters are read with their rules, then allow it', () => {
    // Arrange
    const gateRepository = createFakeGateRepository();
    const source = createFakeActiveRulesSource({
      vocabularies: {
        [coreChapter]: [
          'A **name** is what a thing is called.',
        ],
      },
    });
    const refused = gateOf({
      gateRepository,
      source,
    });

    partsReadAfter({
      gateRepository,
      verdict: refused,
    });

    // Act
    const verdict = gateOf({
      gateRepository,
      source,
    });

    // Assert
    expect({
      refused: unreadReadingOf(refused),
      verdict,
    }).toStrictEqual({
      refused: {
        definitions: 1,
        rules: 3,
      },
      verdict: {
        kind: GateVerdictKind.Allowed,
      },
    });
  });

  it('should ask again for a definition rewritten since it was read, and for no rule', () => {
    // Arrange
    const gateRepository = createFakeGateRepository();

    partsReadAfter({
      gateRepository,
      verdict: gateOf({
        gateRepository,
        source: createFakeActiveRulesSource({
          vocabularies: {
            [coreChapter]: [
              'A **name** is what a thing is called.',
            ],
          },
        }),
      }),
    });

    // Act
    const verdict = gateOf({
      gateRepository,
      source: createFakeActiveRulesSource({
        vocabularies: {
          [coreChapter]: [
            'A **name** is the word a thing is called by.',
          ],
        },
      }),
    });

    // Assert
    expect(unreadReadingOf(verdict)).toStrictEqual({
      definitions: 1,
      rules: 0,
    });
  });

  it('should refuse the third time it refuses one set', () => {
    // Arrange
    const gateRepository = createFakeGateRepository();

    gateOf({
      gateRepository,
    });
    gateOf({
      gateRepository,
    });

    // Act
    const verdict = gateOf({
      gateRepository,
    });

    // Assert
    expect(verdict.kind).toBe(GateVerdictKind.Refused);
  });

  it('should let the action through after three refusals of one set, naming the rules unread', () => {
    // Arrange
    const gateRepository = createFakeGateRepository();

    refusedThrice({
      gateRepository,
      source: createFakeActiveRulesSource(),
    });

    // Act
    const verdict = gateOf({
      gateRepository,
    });

    // Assert
    expect(verdict).toStrictEqual({
      kind: GateVerdictKind.PassedUnread,
      unread: {
        definitions: 0,
        rules: 3,
      },
    });
  });

  it('should owe the rules of the files the agent read, and name the files a command changed', () => {
    // Arrange
    const gateRepository = createFakeGateRepository();
    const changed = AbsolutePath.create('/work/project/src/b.ts');

    owedOf(gateRepository, [
      {
        kind: DebtKind.Read,
        path: sourceFile.path,
      },
      {
        kind: DebtKind.Changed,
        path: changed,
      },
    ]);

    // Act
    const verdict = gateOf({
      gateRepository,
      targets: [
        projectFolder,
      ],
    });

    // Assert
    expect({
      changed: changedOf(verdict),
      unread: unreadOf(verdict),
    }).toStrictEqual({
      changed: [
        changed,
      ],
      unread: 3,
    });
  });

  it.each([
    {
      changed: '/work/project/src/a.ts',
      condition: 'the action edits it too, named once',
      named: [
        '/work/project/src/a.ts',
      ],
    },
    {
      changed: '/work/project/web/src/b.ts',
      condition: 'the agent read all its rules, left out',
      named: [],
    },
    {
      changed: '/tmp/b.ts',
      condition: 'it lies in no project, left out',
      named: [],
    },
  ])(
    'should name a file a command changed whose rules are owed when $condition',
    ({ changed, named }) => {
      // Arrange
      const gateRepository = createFakeGateRepository();

      readRulesOf({
        gateRepository,
        target: webFile,
      });
      owedOf(gateRepository, [
        {
          kind: DebtKind.Changed,
          path: AbsolutePath.create(changed),
        },
      ]);

      // Act
      const verdict = gateOf({
        gateRepository,
      });

      // Assert
      expect<readonly string[] | undefined>(changedOf(verdict)).toStrictEqual(named);
    },
  );

  it.each<{
    condition: string;
    debts: readonly RuleDebt[];
    kept: readonly RuleDebt[];
  }>([
    {
      condition: 'the rules they owe are read, keeping the debt still owed',
      debts: [
        {
          kind: DebtKind.Read,
          path: webFile.path,
        },
        {
          kind: DebtKind.Changed,
          path: AbsolutePath.create('/work/project/src/b.ts'),
        },
      ],
      kept: [
        {
          kind: DebtKind.Changed,
          path: AbsolutePath.create('/work/project/src/b.ts'),
        },
      ],
    },
    {
      condition: 'they lie in no project',
      debts: [
        {
          kind: DebtKind.Read,
          path: AbsolutePath.create('/tmp/a.ts'),
        },
      ],
      kept: [],
    },
    {
      condition: 'their project cannot be read, keeping them',
      debts: [
        {
          kind: DebtKind.Read,
          path: AbsolutePath.create('/work/other/a.ts'),
        },
      ],
      kept: [
        {
          kind: DebtKind.Read,
          path: AbsolutePath.create('/work/other/a.ts'),
        },
      ],
    },
  ])('should settle the debts when $condition', ({ debts, kept }) => {
    // Arrange
    const gateRepository = createFakeGateRepository();

    readRulesOf({
      gateRepository,
      target: webFile,
    });
    owedOf(gateRepository, debts);

    // Act
    gateOf({
      gateRepository,
      source: withOtherProject,
      targets: [
        webFile,
      ],
    });

    // Assert
    expect(
      gateRepository.debts({
        agent: Agents.main,
        session: keptSession,
      }),
    ).toStrictEqual(kept);
  });

  it("should refuse an action on its own project's files for the rules they owe, though a file read lies in a project that cannot be read", () => {
    // Arrange
    const gateRepository = createFakeGateRepository();

    owedOf(gateRepository, [
      {
        kind: DebtKind.Read,
        path: AbsolutePath.create('/work/other/a.ts'),
      },
    ]);

    // Act
    const verdict = gateOf({
      gateRepository,
      source: withOtherProject,
    });

    // Assert
    expect(unreadOf(verdict)).toBe(3);
  });

  it('should close the action, naming why, when the rules of its project cannot be read', () => {
    // Arrange
    const gateRepository = createFakeGateRepository();

    // Act
    const verdict = gateOf({
      gateRepository,
      source: noRelease,
    });

    // Assert
    expect(verdict).toStrictEqual({
      causes: [
        {
          kind: GateCauseKind.NoRelease,
          releaseFolderPath: AbsolutePath.create('/work/project/.droneey/constitution'),
        },
      ],
      kind: GateVerdictKind.Closed,
    });
  });

  it.each([
    {
      condition: 'an edit of the constitution.yaml that does not parse',
      kind: GateVerdictKind.Allowed,
      target: {
        kind: TargetKind.File,
        path: config,
      },
    },
    {
      condition: 'another edit',
      kind: GateVerdictKind.Closed,
      target: sourceFile,
    },
  ])(
    'should give $kind to $condition while constitution.yaml does not parse',
    ({ kind, target }) => {
      // Arrange
      const gateRepository = createFakeGateRepository();

      // Act
      const verdict = gateOf({
        gateRepository,
        source: unparsed,
        targets: [
          target,
        ],
      });

      // Assert
      expect(verdict.kind).toBe(kind);
    },
  );

  it('should let the closed gate pass after three refusals, naming why it was closed', () => {
    // Arrange
    const gateRepository = createFakeGateRepository();

    refusedThrice({
      gateRepository,
      source: noRelease,
    });

    // Act
    const verdict = gateOf({
      gateRepository,
      source: noRelease,
    });

    // Assert
    expect(verdict).toStrictEqual({
      causes: [
        {
          kind: GateCauseKind.NoRelease,
          releaseFolderPath: AbsolutePath.create('/work/project/.droneey/constitution'),
        },
      ],
      kind: GateVerdictKind.PassedClosed,
    });
  });

  it.each<{
    condition: string;
    source: ActiveRulesSource;
    target: GateTarget;
  }>([
    {
      condition: 'the file lies in no project',
      source: createFakeActiveRulesSource(),
      target: {
        kind: TargetKind.File,
        path: AbsolutePath.create('/tmp/a.ts'),
      },
    },
    {
      condition: 'no file of a rule governs it',
      source: createFakeActiveRulesSource({
        files: {
          [coreChapter]: [],
          [uiPassport]: [],
          '/work/project/.droneey/constitution/blocks/contexts/languages/typescript/typescript.md':
            [],
        },
      }),
      target: sourceFile,
    },
  ])('should allow the action when $condition', ({ source, target }) => {
    // Arrange
    const gateRepository = createFakeGateRepository();

    // Act
    const verdict = gateOf({
      gateRepository,
      source,
      targets: [
        target,
      ],
    });

    // Assert
    expect(verdict).toStrictEqual({
      kind: GateVerdictKind.Allowed,
    });
  });

  it('should govern a file reached through a link by the project its real path lies in', () => {
    // Arrange
    const gateRepository = createFakeGateRepository();
    const linked = AbsolutePath.create('/link/src/a.ts');

    // Act
    const verdict = gateOf({
      gateRepository,
      source: createFakeActiveRulesSource({
        links: {
          [linked]: sourceFile.path,
        },
      }),
      targets: [
        {
          kind: TargetKind.File,
          path: linked,
        },
      ],
    });

    // Assert
    expect(unreadOf(verdict)).toBe(3);
  });

  it.each([
    {
      shouldIgnoreParts: false,
      condition: 'git ignores the folder the parts are written to',
      tree: {
        ignored: [
          '.droneey/constitution-sessions',
        ],
      },
    },
    {
      shouldIgnoreParts: true,
      condition: 'git ignores another folder only',
      tree: {
        ignored: [
          '.droneey/constitution',
        ],
      },
    },
    {
      shouldIgnoreParts: false,
      condition: 'git cannot tell whether it ignores the folder',
      tree: {
        repositoryFolderPath: '/work/elsewhere',
      },
    },
  ])(
    'should write the parts into the project and say $shouldIgnoreParts when $condition',
    ({ shouldIgnoreParts, tree }) => {
      // Arrange
      const gateRepository = createFakeGateRepository();

      // Act
      const verdict = gateOf({
        gateRepository,
        workingTree: createFakeWorkingTree(tree),
      });

      // Assert
      expect(placedOf(verdict)).toStrictEqual({
        shouldIgnoreParts,
        isInProject: true,
      });
    },
  );

  it('should close the action, naming the folder, when the rules cannot be written to read', () => {
    // Arrange
    const gateRepository = {
      ...createFakeGateRepository(),
      writeParts: () => [],
    };

    // Act
    const verdict = gateOf({
      gateRepository,
    });

    // Assert
    expect(verdict).toStrictEqual({
      causes: [
        {
          folder: AbsolutePath.create('/work/project'),
          kind: GateCauseKind.Unwritable,
        },
      ],
      kind: GateVerdictKind.Closed,
    });
  });
});
