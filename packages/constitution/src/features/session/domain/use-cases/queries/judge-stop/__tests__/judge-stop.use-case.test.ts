import { describe, expect, it } from 'bun:test';

import { ConfigReadStatus } from '#/kernel/entities';
import { AbsolutePath, BlockId } from '#/kernel/value-objects';

import {
  heldSessionsOf,
  keptBlockOf,
  keptSession,
  sessionStateOf,
} from '../../../../../__tests__/session.fixtures';
import { createFakeSessionQueryRepository } from '../../../../../__tests__/session-query-repository.fake';
import { createFakeWorkingTree } from '../../../../../__tests__/working-tree.fake';
import { TreeStateStatus } from '../../../../contracts';
import type { StopEvent } from '../../../../entities';
import {
  HandBackStep,
  HookEventName,
  SessionAgent,
  SessionMark,
  StopVerdict,
} from '../../../../entities';
import { AgentId, SessionId, TreeFingerprint } from '../../../../value-objects';
import { judgeStop } from '../judge-stop.use-case';

const treeNow = TreeFingerprint.create('tree-now');
const treeBefore = TreeFingerprint.create('tree-before');

const savedState = sessionStateOf({
  active: [
    keptBlockOf({
      governs: [
        '**/ui/**',
      ],
      id: 'ui',
    }),
    keptBlockOf({
      governs: [
        '**/*.ts',
      ],
      id: 'typescript',
    }),
  ],
});
type SubagentStopEvent = Extract<
  StopEvent,
  {
    readonly event: HookEventName.SubagentStop;
  }
>;

const changedFiles = [
  'src/b.ts',
  'src/ui/a.ts',
  'src/ui/c.ts',
];

const subagent = AgentId.create('agent-1');

interface Mark {
  readonly mark: SessionMark;
  readonly value: string;
}

interface OwnFixture {
  readonly agent: SessionAgent;
  readonly paths: readonly string[];
}

const stopEventOf = (input: {
  agent: AgentId;
  event: HookEventName;
  isHookActive: boolean;
}): StopEvent => {
  const { event } = input;

  return event === HookEventName.SubagentStop
    ? {
        agent: input.agent,
        event,
        isHookActive: input.isHookActive,
        session: keptSession,
      }
    : {
        agent: SessionAgent.main,
        event: HookEventName.Stop,
        isHookActive: input.isHookActive,
        session: keptSession,
      };
};

const judgeOf = (input: {
  agent?: AgentId;
  debt?: readonly string[];
  event: HookEventName;
  isHookActive?: boolean;
  marks: readonly Mark[];
  own: OwnFixture;
}) => {
  const held = heldSessionsOf({
    marks: input.marks,
    own: [
      {
        agent: input.own.agent,
        paths: input.own.paths.map((path) =>
          AbsolutePath.is(path) ? path : AbsolutePath.create(`/work/project/${path}`),
        ),
      },
    ],
    review: (input.debt ?? []).map((path) => ({
      agent: subagent,
      path: AbsolutePath.create(`/work/project/${path}`),
    })),
    state: savedState,
  });

  return judgeStop({
    ...stopEventOf({
      agent: input.agent ?? subagent,
      event: input.event,
      isHookActive: input.isHookActive ?? false,
    }),
    sessions: createFakeSessionQueryRepository(held),
    workingTree: createFakeWorkingTree({
      changed: changedFiles,
      state: treeNow,
    }),
  });
};

describe('judgeStop', () => {
  it.each<{
    agent: Pick<SubagentStopEvent, 'agentName' | 'agentType'>;
    condition: string;
    isHookActive: boolean;
  }>([
    {
      agent: {
        agentType: 'constitution:reviewer',
      },
      condition: 'the reviewer, by its type, stops while a hook is active',
      isHookActive: true,
    },
    {
      agent: {
        agentName: 'constitution:reviewer',
        agentType: 'general-purpose',
      },
      condition: 'the reviewer, by its name, stops',
      isHookActive: false,
    },
  ])('should judge the tree reviewed when $condition', ({ agent, isHookActive }) => {
    // Arrange
    const sessions = createFakeSessionQueryRepository(
      heldSessionsOf({
        state: savedState,
      }),
    );

    // Act
    const judgement = judgeStop({
      ...agent,
      agent: subagent,
      event: HookEventName.SubagentStop,
      isHookActive,
      session: keptSession,
      sessions,
      workingTree: createFakeWorkingTree({
        changed: changedFiles,
        state: treeNow,
      }),
    });

    // Assert
    expect(judgement).toStrictEqual({
      fingerprint: treeNow,
      verdict: StopVerdict.Reviewed,
    });
  });

  it.each<{
    agent?: AgentId;
    blocks: readonly string[];
    condition: string;
    event: HookEventName;
    marks: readonly Mark[];
    missing: readonly HandBackStep[];
    own: readonly string[];
  }>([
    {
      blocks: [
        'typescript',
        'ui',
      ],
      condition: 'the main session changed files and the tree is neither checked nor reviewed',
      event: HookEventName.Stop,
      marks: [],
      missing: [
        HandBackStep.Check,
        HandBackStep.Review,
      ],
      own: changedFiles,
    },
    {
      agent: subagent,
      blocks: [],
      condition:
        'a subagent stops with its own changes unchecked, and is not held for the review it cannot start',
      event: HookEventName.SubagentStop,
      marks: [
        {
          mark: SessionMark.Turn,
          value: treeBefore,
        },
      ],
      missing: [
        HandBackStep.Check,
      ],
      own: changedFiles,
    },
    {
      blocks: [
        'typescript',
        'ui',
      ],
      condition: 'the check passed on the tree and the review was of another',
      event: HookEventName.Stop,
      marks: [
        {
          mark: SessionMark.Checked,
          value: treeNow,
        },
        {
          mark: SessionMark.Reviewed,
          value: treeBefore,
        },
      ],
      missing: [
        HandBackStep.Review,
      ],
      own: changedFiles,
    },
    {
      blocks: [],
      condition: 'the review was of the tree and the check passed on another',
      event: HookEventName.Stop,
      marks: [
        {
          mark: SessionMark.Checked,
          value: treeBefore,
        },
        {
          mark: SessionMark.Reviewed,
          value: treeNow,
        },
      ],
      missing: [
        HandBackStep.Check,
      ],
      own: changedFiles,
    },
    {
      blocks: [],
      condition: 'no active block governs its own changes, so no review is needed',
      event: HookEventName.Stop,
      marks: [],
      missing: [
        HandBackStep.Check,
      ],
      own: [
        'README.md',
        '/elsewhere/notes.md',
      ],
    },
  ])(
    'should hold the hand-back of whoever made the change for what the tree lacks when $condition',
    ({ agent, blocks, event, marks, missing, own }) => {
      // Act
      const judgement = judgeOf({
        ...(agent === undefined
          ? {}
          : {
              agent,
            }),
        event,
        marks,
        own: {
          agent: agent ?? SessionAgent.main,
          paths: own,
        },
      });

      // Assert
      expect(judgement).toStrictEqual({
        blocks: blocks.map(BlockId.create),
        fingerprint: treeNow,
        missing,
        subagentChanges: [],
        verdict: StopVerdict.Blocked,
      });
    },
  );

  it("should hold the main session for the review alone of a subagent's handed-over changes, naming them", () => {
    // Act
    const judgement = judgeOf({
      debt: changedFiles,
      event: HookEventName.Stop,
      marks: [
        {
          mark: SessionMark.Checked,
          value: treeNow,
        },
      ],
      own: {
        agent: SessionAgent.main,
        paths: [],
      },
    });

    // Assert
    expect(judgement).toStrictEqual({
      blocks: [
        BlockId.create('typescript'),
        BlockId.create('ui'),
      ],
      fingerprint: treeNow,
      missing: [
        HandBackStep.Review,
      ],
      subagentChanges: [
        {
          agent: subagent,
          path: AbsolutePath.create('/work/project/src/b.ts'),
        },
        {
          agent: subagent,
          path: AbsolutePath.create('/work/project/src/ui/a.ts'),
        },
        {
          agent: subagent,
          path: AbsolutePath.create('/work/project/src/ui/c.ts'),
        },
      ],
      verdict: StopVerdict.Blocked,
    });
  });

  it("should hold the main session for the review of its own changes and a subagent's alike", () => {
    // Act
    const judgement = judgeOf({
      debt: [
        'src/ui/a.ts',
      ],
      event: HookEventName.Stop,
      marks: [
        {
          mark: SessionMark.Checked,
          value: treeNow,
        },
      ],
      own: {
        agent: SessionAgent.main,
        paths: [
          'src/b.ts',
        ],
      },
    });

    // Assert
    expect(judgement).toStrictEqual({
      blocks: [
        BlockId.create('typescript'),
        BlockId.create('ui'),
      ],
      fingerprint: treeNow,
      missing: [
        HandBackStep.Review,
      ],
      subagentChanges: [
        {
          agent: subagent,
          path: AbsolutePath.create('/work/project/src/ui/a.ts'),
        },
      ],
      verdict: StopVerdict.Blocked,
    });
  });

  it("should judge a subagent's handed-over changes covered once a review covers the tree, though the check is of another", () => {
    // Act
    const judgement = judgeOf({
      debt: changedFiles,
      event: HookEventName.Stop,
      marks: [
        {
          mark: SessionMark.Checked,
          value: treeBefore,
        },
        {
          mark: SessionMark.Reviewed,
          value: treeNow,
        },
      ],
      own: {
        agent: SessionAgent.main,
        paths: [],
      },
    });

    // Assert
    expect(judgement).toStrictEqual({
      subagentChanges: [
        {
          agent: subagent,
          path: AbsolutePath.create('/work/project/src/b.ts'),
        },
        {
          agent: subagent,
          path: AbsolutePath.create('/work/project/src/ui/a.ts'),
        },
        {
          agent: subagent,
          path: AbsolutePath.create('/work/project/src/ui/c.ts'),
        },
      ],
      verdict: StopVerdict.Covered,
    });
  });

  it('should judge the own changes covered when the check passed on the tree and the review covers it', () => {
    // Act
    const judgement = judgeOf({
      event: HookEventName.Stop,
      marks: [
        {
          mark: SessionMark.Checked,
          value: treeNow,
        },
        {
          mark: SessionMark.Reviewed,
          value: treeNow,
        },
      ],
      own: {
        agent: SessionAgent.main,
        paths: changedFiles,
      },
    });

    // Assert
    expect(judgement).toStrictEqual({
      subagentChanges: [],
      verdict: StopVerdict.Covered,
    });
  });

  it.each<{
    agent?: AgentId;
    condition: string;
    event: HookEventName;
    isHookActive?: boolean;
    marks: readonly Mark[];
    own: OwnFixture;
  }>([
    {
      condition: 'a stop hook is already active, as at a second stop in a row',
      event: HookEventName.Stop,
      isHookActive: true,
      marks: [],
      own: {
        agent: SessionAgent.main,
        paths: changedFiles,
      },
    },
    {
      condition: 'the turn changed nothing',
      event: HookEventName.Stop,
      marks: [
        {
          mark: SessionMark.Turn,
          value: treeNow,
        },
      ],
      own: {
        agent: SessionAgent.main,
        paths: changedFiles,
      },
    },
    {
      condition: 'the main session changed nothing itself and only a subagent changed files',
      event: HookEventName.Stop,
      marks: [],
      own: {
        agent: subagent,
        paths: changedFiles,
      },
    },
    {
      agent: subagent,
      condition:
        'a subagent passed the check on its own changes, whose review it leaves to the coordinator',
      event: HookEventName.SubagentStop,
      marks: [
        {
          mark: SessionMark.Checked,
          value: treeNow,
        },
      ],
      own: {
        agent: subagent,
        paths: changedFiles,
      },
    },
    {
      agent: subagent,
      condition: 'a subagent changed nothing itself and the main session did',
      event: HookEventName.SubagentStop,
      marks: [],
      own: {
        agent: SessionAgent.main,
        paths: changedFiles,
      },
    },
  ])('should let the agent stop when $condition', ({ agent, event, isHookActive, marks, own }) => {
    // Act
    const judgement = judgeOf({
      ...(agent === undefined
        ? {}
        : {
            agent,
          }),
      event,
      isHookActive: isHookActive ?? false,
      marks,
      own,
    });

    // Assert
    expect(judgement).toBeUndefined();
  });

  it('should tell the gate cannot judge the tree when git fails for a reason not yet told', () => {
    // Arrange
    const sessions = createFakeSessionQueryRepository(
      heldSessionsOf({
        marks: [
          {
            mark: SessionMark.Unjudged,
            value: 'fatal: an older failure',
          },
        ],
        state: savedState,
      }),
    );

    // Act
    const judgement = judgeStop({
      agent: SessionAgent.main,
      event: HookEventName.Stop,
      isHookActive: false,
      session: keptSession,
      sessions,
      workingTree: createFakeWorkingTree({
        changed: changedFiles,
        state: {
          reason: 'fatal: bad config',
          status: TreeStateStatus.Failed,
        },
      }),
    });

    // Assert
    expect(judgement).toStrictEqual({
      reason: 'fatal: bad config',
      verdict: StopVerdict.Unjudged,
    });
  });

  it.each<{
    condition: string;
    event: StopEvent;
    marks: readonly {
      mark: SessionMark;
      value: string;
    }[];
    tree: Parameters<typeof createFakeWorkingTree>[0];
  }>([
    {
      condition: 'the project lies in no repository',
      event: {
        agent: SessionAgent.main,
        event: HookEventName.Stop,
        isHookActive: false,
        session: keptSession,
      },
      marks: [
        {
          mark: SessionMark.Turn,
          value: treeBefore,
        },
        {
          mark: SessionMark.Checked,
          value: treeBefore,
        },
      ],
      tree: {
        repositoryFolderPath: '/work/elsewhere',
      },
    },
    {
      condition: 'git fails for the reason told before',
      event: {
        agent: SessionAgent.main,
        event: HookEventName.Stop,
        isHookActive: false,
        session: keptSession,
      },
      marks: [
        {
          mark: SessionMark.Unjudged,
          value: 'fatal: bad config',
        },
      ],
      tree: {
        state: {
          reason: 'fatal: bad config',
          status: TreeStateStatus.Failed,
        },
      },
    },
    {
      condition: 'the reviewer stops while git fails',
      event: {
        agent: subagent,
        agentType: 'constitution:reviewer',
        event: HookEventName.SubagentStop,
        isHookActive: false,
        session: keptSession,
      },
      marks: [],
      tree: {
        state: {
          reason: 'fatal: bad config',
          status: TreeStateStatus.Failed,
        },
      },
    },
    {
      condition: 'the project lies in no repository, though git failed before',
      event: {
        agent: SessionAgent.main,
        event: HookEventName.Stop,
        isHookActive: false,
        session: keptSession,
      },
      marks: [
        {
          mark: SessionMark.Unjudged,
          value: 'fatal: bad config',
        },
      ],
      tree: {
        state: {
          status: TreeStateStatus.NoRepository,
        },
      },
    },
    {
      condition: 'a stop hook is already active while git fails',
      event: {
        agent: SessionAgent.main,
        event: HookEventName.Stop,
        isHookActive: true,
        session: keptSession,
      },
      marks: [],
      tree: {
        state: {
          reason: 'fatal: bad config',
          status: TreeStateStatus.Failed,
        },
      },
    },
  ])(
    'should say nothing of the tree, though the session changed files, when $condition',
    ({ event, marks, tree }) => {
      // Arrange
      const held = heldSessionsOf({
        marks,
        own: [
          {
            agent: SessionAgent.main,
            paths: changedFiles.map((path) => AbsolutePath.create(`/work/project/${path}`)),
          },
        ],
        state: savedState,
      });

      const sessions = createFakeSessionQueryRepository(held);

      // Act
      const judgement = judgeStop({
        ...event,
        sessions,
        workingTree: createFakeWorkingTree(tree),
      });

      // Assert
      expect(judgement).toBeUndefined();
    },
  );

  it.each([
    {
      condition: 'the session kept no state',
      session: SessionId.create('session-2'),
    },
    {
      condition: 'the session started where constitution.yaml did not parse',
      session: keptSession,
    },
  ])('should judge nothing when $condition', ({ session }) => {
    // Arrange
    const sessions = createFakeSessionQueryRepository(
      heldSessionsOf({
        state: {
          repositoryFolderPath: AbsolutePath.create('/work/project'),
          status: ConfigReadStatus.Unparsed,
        },
      }),
    );

    // Act
    const judgement = judgeStop({
      agentType: 'constitution:reviewer',
      agent: subagent,
      event: HookEventName.SubagentStop,
      isHookActive: false,
      session,
      sessions,
      workingTree: createFakeWorkingTree({
        changed: changedFiles,
        state: treeNow,
      }),
    });

    // Assert
    expect(judgement).toBeUndefined();
  });
});
