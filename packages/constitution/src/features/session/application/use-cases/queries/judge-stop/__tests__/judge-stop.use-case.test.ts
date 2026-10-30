import { describe, expect, it } from 'bun:test';

import { ConfigReadStatus } from '#/kernel/entities';
import { AbsolutePath, BlockId } from '#/kernel/value-objects';

import {
  activeBlockOf,
  heldSessionsOf,
  keptSession,
  sessionStateOf,
} from '../../../../../__tests__/session.fixtures';
import { createFakeSessionQueryRepository } from '../../../../../__tests__/session-query-repository.fake';
import { createFakeWorkingTree } from '../../../../../__tests__/working-tree.fake';
import type { StopEvent } from '../../../../../domain/entities';
import {
  HookEventName,
  SessionMark,
  StopVerdict,
  TreeStateStatus,
} from '../../../../../domain/entities';
import { SessionId, TreeFingerprint } from '../../../../../domain/value-objects';
import { judgeStop } from '../judge-stop.use-case';

const treeNow = TreeFingerprint.create('tree-now');
const treeBefore = TreeFingerprint.create('tree-before');

const savedState = sessionStateOf({
  active: [
    activeBlockOf({
      governs: [
        '**/ui/**',
      ],
      id: 'ui',
    }),
    activeBlockOf({
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
    condition: string;
    event: HookEventName;
    marks: readonly {
      mark: SessionMark;
      value: string;
    }[];
  }>([
    {
      condition: 'the main session ends on a tree the check never passed',
      event: HookEventName.Stop,
      marks: [],
    },
    {
      condition: 'the check last passed, and the gate last blocked, on another tree',
      event: HookEventName.SubagentStop,
      marks: [
        {
          mark: SessionMark.Checked,
          value: treeBefore,
        },
        {
          mark: SessionMark.Blocked,
          value: treeBefore,
        },
        {
          mark: SessionMark.Turn,
          value: treeBefore,
        },
      ],
    },
  ])('should block the hand-back until the check passes when $condition', ({ event, marks }) => {
    // Arrange
    const sessions = createFakeSessionQueryRepository(
      heldSessionsOf({
        marks,
        state: savedState,
      }),
    );

    // Act
    const judgement = judgeStop({
      event,
      isHookActive: false,
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
      verdict: StopVerdict.Blocked,
    });
  });

  it.each([
    {
      condition: 'the check passed on the tree',
      marks: [
        {
          mark: SessionMark.Checked,
          value: treeNow,
        },
      ],
    },
    {
      condition: 'the gate blocked the tree before',
      marks: [
        {
          mark: SessionMark.Blocked,
          value: treeNow,
        },
        {
          mark: SessionMark.Reviewed,
          value: treeBefore,
        },
      ],
    },
  ])(
    'should ask for a review of the blocks the changed files fall under when $condition',
    ({ marks }) => {
      // Arrange
      const sessions = createFakeSessionQueryRepository(
        heldSessionsOf({
          marks,
          state: savedState,
        }),
      );

      // Act
      const judgement = judgeStop({
        event: HookEventName.Stop,
        isHookActive: false,
        session: keptSession,
        sessions,
        workingTree: createFakeWorkingTree({
          changed: changedFiles,
          state: treeNow,
        }),
      });

      // Assert
      expect(judgement).toStrictEqual({
        blocks: [
          BlockId.create('typescript'),
          BlockId.create('ui'),
        ],
        verdict: StopVerdict.Review,
      });
    },
  );

  it.each([
    {
      changed: changedFiles,
      condition: 'a stop hook is already active',
      event: HookEventName.Stop,
      isHookActive: true,
      marks: [],
    },
    {
      changed: changedFiles,
      condition: 'the turn changed nothing',
      event: HookEventName.Stop,
      isHookActive: false,
      marks: [
        {
          mark: SessionMark.Turn,
          value: treeNow,
        },
      ],
    },
    {
      changed: changedFiles,
      condition: 'the reviewer reviewed the tree',
      event: HookEventName.Stop,
      isHookActive: false,
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
    },
    {
      changed: changedFiles,
      condition: 'a subagent stops after the check passed',
      event: HookEventName.SubagentStop,
      isHookActive: false,
      marks: [
        {
          mark: SessionMark.Checked,
          value: treeNow,
        },
      ],
    },
    {
      changed: [
        'README.md',
      ],
      condition: 'no active block governs the changed files',
      event: HookEventName.Stop,
      isHookActive: false,
      marks: [
        {
          mark: SessionMark.Checked,
          value: treeNow,
        },
      ],
    },
  ])('should let the agent stop when $condition', ({ changed, event, isHookActive, marks }) => {
    // Arrange
    const sessions = createFakeSessionQueryRepository(
      heldSessionsOf({
        marks,
        state: savedState,
      }),
    );

    // Act
    const judgement = judgeStop({
      event,
      isHookActive,
      session: keptSession,
      sessions,
      workingTree: createFakeWorkingTree({
        changed,
        state: treeNow,
      }),
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
        {
          mark: SessionMark.Blocked,
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
      condition: 'a stop hook is already active while git fails',
      event: {
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
  ])('should say nothing of the tree when $condition', ({ event, marks, tree }) => {
    // Arrange
    const sessions = createFakeSessionQueryRepository(
      heldSessionsOf({
        marks,
        state: savedState,
      }),
    );

    // Act
    const judgement = judgeStop({
      ...event,
      sessions,
      workingTree: createFakeWorkingTree(tree),
    });

    // Assert
    expect(judgement).toBeUndefined();
  });

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
