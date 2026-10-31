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
import { createFakeGateCommandRepository } from '../../../../../__tests__/gate-command-repository.fake';
import { keptSession } from '../../../../../__tests__/session.fixtures';
import { createFakeWorkingTree } from '../../../../../__tests__/working-tree.fake';
import type { ActiveRulesSource, WorkingTree } from '../../../../contracts';
import { ActiveReadStatus } from '../../../../contracts';
import type { GateCommandRepository } from '../../../../contracts/repositories/commands';
import type { GateTarget, GateVerdict, RuleDebt, SessionAgent } from '../../../../entities';
import {
  SessionAgent as Agents,
  DebtKind,
  GateCauseKind,
  GateVerdictKind,
  TargetKind,
} from '../../../../entities';
import { AgentId } from '../../../../value-objects';
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
  findProjectAround: (searchFrom: AbsolutePath): ProjectPlace | undefined =>
    searchFrom.startsWith('/work/other')
      ? otherPlace
      : createFakeActiveRulesSource().findProjectAround(searchFrom),
};

const gateOf = (input: {
  agent?: SessionAgent;
  gates: GateCommandRepository;
  source?: ActiveRulesSource;
  targets?: readonly GateTarget[];
  workingTree?: WorkingTree;
}): GateVerdict =>
  gateAction({
    agent: input.agent ?? Agents.main,
    gates: input.gates,
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
  gates: GateCommandRepository;
  verdict: GateVerdict;
}): void => {
  for (const path of input.verdict.kind === GateVerdictKind.Refused ? input.verdict.parts : []) {
    input.gates.addRulesRead({
      agent: input.agent ?? Agents.main,
      rules:
        input.gates.partOf({
          path,
          session: keptSession,
        })?.rules ?? [],
      session: keptSession,
    });
  }
};

const readRulesOf = (input: { gates: GateCommandRepository; target: GateTarget }): void => {
  partsReadAfter({
    gates: input.gates,
    verdict: gateOf({
      gates: input.gates,
      targets: [
        input.target,
      ],
    }),
  });
};

const owedOf = (gates: GateCommandRepository, debts: readonly RuleDebt[]): void => {
  gates.addDebts({
    agent: Agents.main,
    debts,
    session: keptSession,
  });
};

const refusedThrice = (input: {
  gates: GateCommandRepository;
  source: ActiveRulesSource;
}): void => {
  gateOf(input);
  gateOf(input);
  gateOf(input);
};

const unreadOf = (verdict: GateVerdict): number | undefined =>
  verdict.kind === GateVerdictKind.Refused || verdict.kind === GateVerdictKind.PassedUnread
    ? verdict.unreadCount
    : undefined;

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
    const gates = createFakeGateCommandRepository();

    // Act
    const verdict = gateOf({
      gates,
      targets: [
        target,
      ],
    });

    // Assert
    expect(unreadOf(verdict)).toBe(unread);
  });

  it('should allow an edit once the rules its parts name are read', () => {
    // Arrange
    const gates = createFakeGateCommandRepository();

    readRulesOf({
      gates,
      target: sourceFile,
    });

    // Act
    const verdict = gateOf({
      gates,
    });

    // Assert
    expect(verdict).toStrictEqual({
      kind: GateVerdictKind.Allowed,
    });
  });

  it('should ask a subagent for the rules though the session read them', () => {
    // Arrange
    const gates = createFakeGateCommandRepository();

    readRulesOf({
      gates,
      target: sourceFile,
    });

    // Act
    const verdict = gateOf({
      agent: subagent,
      gates,
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
    const gates = createFakeGateCommandRepository();

    readRulesOf({
      gates,
      target: sourceFile,
    });

    // Act
    const verdict = gateOf({
      gates,
      source,
    });

    // Assert
    expect(unreadOf(verdict)).toBe(1);
  });

  it('should refuse the third time it refuses one set', () => {
    // Arrange
    const gates = createFakeGateCommandRepository();

    gateOf({
      gates,
    });
    gateOf({
      gates,
    });

    // Act
    const verdict = gateOf({
      gates,
    });

    // Assert
    expect(verdict.kind).toBe(GateVerdictKind.Refused);
  });

  it('should let the action through after three refusals of one set, naming the rules unread', () => {
    // Arrange
    const gates = createFakeGateCommandRepository();

    refusedThrice({
      gates,
      source: createFakeActiveRulesSource(),
    });

    // Act
    const verdict = gateOf({
      gates,
    });

    // Assert
    expect(verdict).toStrictEqual({
      kind: GateVerdictKind.PassedUnread,
      unreadCount: 3,
    });
  });

  it('should owe the rules of the files the agent read, and name the files a command changed', () => {
    // Arrange
    const gates = createFakeGateCommandRepository();
    const changed = AbsolutePath.create('/work/project/src/b.ts');

    owedOf(gates, [
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
      gates,
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
      const gates = createFakeGateCommandRepository();

      readRulesOf({
        gates,
        target: webFile,
      });
      owedOf(gates, [
        {
          kind: DebtKind.Changed,
          path: AbsolutePath.create(changed),
        },
      ]);

      // Act
      const verdict = gateOf({
        gates,
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
    const gates = createFakeGateCommandRepository();

    readRulesOf({
      gates,
      target: webFile,
    });
    owedOf(gates, debts);

    // Act
    gateOf({
      gates,
      source: withOtherProject,
      targets: [
        webFile,
      ],
    });

    // Assert
    expect(
      gates.debts({
        agent: Agents.main,
        session: keptSession,
      }),
    ).toStrictEqual(kept);
  });

  it("should refuse an action on its own project's files for the rules they owe, though a file read lies in a project that cannot be read", () => {
    // Arrange
    const gates = createFakeGateCommandRepository();

    owedOf(gates, [
      {
        kind: DebtKind.Read,
        path: AbsolutePath.create('/work/other/a.ts'),
      },
    ]);

    // Act
    const verdict = gateOf({
      gates,
      source: withOtherProject,
    });

    // Assert
    expect(unreadOf(verdict)).toBe(3);
  });

  it('should close the action, naming why, when the rules of its project cannot be read', () => {
    // Arrange
    const gates = createFakeGateCommandRepository();

    // Act
    const verdict = gateOf({
      gates,
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
      const gates = createFakeGateCommandRepository();

      // Act
      const verdict = gateOf({
        gates,
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
    const gates = createFakeGateCommandRepository();

    refusedThrice({
      gates,
      source: noRelease,
    });

    // Act
    const verdict = gateOf({
      gates,
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
    const gates = createFakeGateCommandRepository();

    // Act
    const verdict = gateOf({
      gates,
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
    const gates = createFakeGateCommandRepository();
    const linked = AbsolutePath.create('/link/src/a.ts');

    // Act
    const verdict = gateOf({
      gates,
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
      const gates = createFakeGateCommandRepository();

      // Act
      const verdict = gateOf({
        gates,
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
    const gates = {
      ...createFakeGateCommandRepository(),
      writeParts: () => [],
    };

    // Act
    const verdict = gateOf({
      gates,
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
