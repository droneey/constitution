import { describe, expect, it } from 'bun:test';

import { AbsolutePath, BlockId } from '#/kernel/value-objects';

import { keptBlockOf, keptSession, sessionStateOf } from '../../../../__tests__/session.fixtures';
import { SessionAgent, SessionMark } from '../../../session/entities';
import { AgentId } from '../../../session/value-objects';
import { HookEventName } from '../../../shared/entities';
import type { TreeState } from '../../../tree-state/entities';
import { TreeStateStatus } from '../../../tree-state/entities';
import { TreeFingerprint } from '../../../tree-state/value-objects';
import type { ReviewDebt } from '../review-debt.entity';
import type { StopEvent } from '../stop-event.entity';
import type { StopMarks } from '../stop-judgement.entity';
import { HandBackStep, StopJudgement, StopVerdict } from '../stop-judgement.entity';

const treeNow = TreeFingerprint.create('tree-now');
const treeBefore = TreeFingerprint.create('tree-before');
const readTree: TreeState = {
  fingerprint: treeNow,
  status: TreeStateStatus.Read,
};
const noMarks: StopMarks = {
  [SessionMark.Checked]: undefined,
  [SessionMark.Reviewed]: undefined,
  [SessionMark.Turn]: treeBefore,
};
const stop: StopEvent = {
  agent: SessionAgent.main,
  event: HookEventName.Stop,
  isHookActive: false,
  session: keptSession,
};
const subagent = AgentId.create('agent-1');
const subagentStop: StopEvent = {
  agent: subagent,
  event: HookEventName.SubagentStop,
  isHookActive: false,
  session: keptSession,
};
const reviewerStop: StopEvent = {
  agent: subagent,
  agentType: 'constitution:reviewer',
  event: HookEventName.SubagentStop,
  isHookActive: true,
  session: keptSession,
};
const state = sessionStateOf({
  active: [
    keptBlockOf({
      governs: [
        '**/ui/**',
      ],
      id: 'ui',
    }),
  ],
});
const ownFile = AbsolutePath.create('/work/project/src/ui/a.ts');
const owedReview: ReviewDebt = {
  agent: subagent,
  path: AbsolutePath.create('/work/project/src/ui/b.ts'),
};

describe('StopJudgement.judge', () => {
  it.each<{
    condition: string;
    event?: StopEvent;
    expected: ReturnType<typeof StopJudgement.judge>;
    marks?: Partial<StopMarks>;
    own?: readonly AbsolutePath[];
    reviewOwed?: readonly ReviewDebt[];
    tree?: TreeState;
    unjudged?: string;
  }>([
    {
      condition: 'the reviewer stops',
      event: reviewerStop,
      expected: {
        fingerprint: treeNow,
        verdict: StopVerdict.Reviewed,
      },
    },
    {
      condition: 'the reviewer stops and git cannot report the tree',
      event: reviewerStop,
      expected: undefined,
      tree: {
        reason: 'fatal: bad config',
        status: TreeStateStatus.Failed,
      },
    },
    {
      condition: 'a hook is active',
      event: {
        ...stop,
        isHookActive: true,
      },
      expected: undefined,
      own: [
        ownFile,
      ],
    },
    {
      condition: 'no repository holds the project',
      expected: undefined,
      tree: {
        status: TreeStateStatus.NoRepository,
      },
    },
    {
      condition: 'git fails for a reason not yet told',
      expected: {
        reason: 'fatal: bad config',
        verdict: StopVerdict.Unjudged,
      },
      tree: {
        reason: 'fatal: bad config',
        status: TreeStateStatus.Failed,
      },
      unjudged: 'fatal: other',
    },
    {
      condition: 'git fails for the reason already told',
      expected: undefined,
      tree: {
        reason: 'fatal: bad config',
        status: TreeStateStatus.Failed,
      },
      unjudged: 'fatal: bad config',
    },
    {
      condition: 'the tree is as the turn began',
      expected: undefined,
      marks: {
        [SessionMark.Turn]: treeNow,
      },
      own: [
        ownFile,
      ],
    },
    {
      condition: 'the agent changed nothing and owes no review',
      expected: undefined,
    },
    {
      condition: 'the session changed a governed file it neither checked nor had reviewed',
      expected: {
        blocks: [
          BlockId.create('ui'),
        ],
        fingerprint: treeNow,
        missing: [
          HandBackStep.Check,
          HandBackStep.Review,
        ],
        subagentChanges: [],
        verdict: StopVerdict.Blocked,
      },
      own: [
        ownFile,
      ],
    },
    {
      condition: 'the session owes the review of a subagent’s changes',
      expected: {
        blocks: [
          BlockId.create('ui'),
        ],
        fingerprint: treeNow,
        missing: [
          HandBackStep.Review,
        ],
        subagentChanges: [
          owedReview,
        ],
        verdict: StopVerdict.Blocked,
      },
      reviewOwed: [
        owedReview,
      ],
    },
    {
      condition: 'the session checked and had reviewed the tree',
      expected: {
        subagentChanges: [
          owedReview,
        ],
        verdict: StopVerdict.Covered,
      },
      marks: {
        [SessionMark.Checked]: treeNow,
        [SessionMark.Reviewed]: treeNow,
      },
      own: [
        ownFile,
      ],
      reviewOwed: [
        owedReview,
      ],
    },
    {
      condition: 'a subagent stops on changes it did not check',
      event: subagentStop,
      expected: {
        blocks: [],
        fingerprint: treeNow,
        missing: [
          HandBackStep.Check,
        ],
        subagentChanges: [],
        verdict: StopVerdict.Blocked,
      },
      own: [
        ownFile,
      ],
    },
    {
      condition: 'a subagent stops on changes it checked',
      event: subagentStop,
      expected: undefined,
      marks: {
        [SessionMark.Checked]: treeNow,
      },
      own: [
        ownFile,
      ],
    },
  ])('should judge the stop when $condition', ({ expected, ...given }) => {
    // Arrange
    const event = given.event ?? stop;
    const input = {
      event,
      isMainThread: event.agent === SessionAgent.main,
      marks: {
        ...noMarks,
        ...given.marks,
      },
      own: given.own ?? [],
      reviewOwed: given.reviewOwed ?? [],
      state,
      tree: given.tree ?? readTree,
      unjudged: given.unjudged,
    };

    // Act
    const judgement = StopJudgement.judge(input);

    // Assert
    expect(judgement).toStrictEqual(expected);
  });
});
