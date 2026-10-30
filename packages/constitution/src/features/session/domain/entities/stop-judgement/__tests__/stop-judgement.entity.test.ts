import { describe, expect, it } from 'bun:test';

import { BlockId, RepositoryRelativePath } from '#/kernel/value-objects';

import { activeBlockOf, keptSession, sessionStateOf } from '../../../../__tests__/session.fixtures';
import { TreeFingerprint } from '../../../value-objects';
import { HookEventName } from '../../hook-event-name';
import { SessionMark } from '../../session-mark';
import type { StopEvent } from '../../stop-event';
import type { TreeState } from '../../tree-state';
import { TreeStateStatus } from '../../tree-state';
import type { StopMarks } from '../stop-judgement.entity';
import { StopJudgement, StopVerdict } from '../stop-judgement.entity';

const treeNow = TreeFingerprint.create('tree-now');
const treeBefore = TreeFingerprint.create('tree-before');
const readTree: TreeState = {
  fingerprint: treeNow,
  status: TreeStateStatus.Read,
};
const noMarks: StopMarks = {
  [SessionMark.Blocked]: undefined,
  [SessionMark.Checked]: undefined,
  [SessionMark.Reviewed]: undefined,
  [SessionMark.Turn]: undefined,
};
const stop: StopEvent = {
  event: HookEventName.Stop,
  isHookActive: false,
  session: keptSession,
};
const reviewerStop: StopEvent = {
  agentType: 'constitution:reviewer',
  event: HookEventName.SubagentStop,
  isHookActive: true,
  session: keptSession,
};

describe('StopJudgement.judge', () => {
  it.each<{
    condition: string;
    event?: StopEvent;
    expected: ReturnType<typeof StopJudgement.judge>;
    marks?: Partial<StopMarks>;
    tree?: TreeState;
    unjudged?: string;
  }>([
    {
      condition: 'the reviewer stops',
      event: reviewerStop,
      expected: {
        isReviewDue: false,
        judgement: {
          fingerprint: treeNow,
          verdict: StopVerdict.Reviewed,
        },
      },
    },
    {
      condition: 'the reviewer stops and git cannot report the tree',
      event: reviewerStop,
      expected: {
        isReviewDue: false,
        judgement: undefined,
      },
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
      expected: {
        isReviewDue: false,
        judgement: undefined,
      },
    },
    {
      condition: 'no repository holds the project',
      expected: {
        isReviewDue: false,
        judgement: undefined,
      },
      tree: {
        status: TreeStateStatus.NoRepository,
      },
    },
    {
      condition: 'git fails for a reason not yet told',
      expected: {
        isReviewDue: false,
        judgement: {
          reason: 'fatal: bad config',
          verdict: StopVerdict.Unjudged,
        },
      },
      tree: {
        reason: 'fatal: bad config',
        status: TreeStateStatus.Failed,
      },
      unjudged: 'fatal: other',
    },
    {
      condition: 'git fails for the reason already told',
      expected: {
        isReviewDue: false,
        judgement: undefined,
      },
      tree: {
        reason: 'fatal: bad config',
        status: TreeStateStatus.Failed,
      },
      unjudged: 'fatal: bad config',
    },
    {
      condition: 'the tree changed since the turn began and was not checked',
      expected: {
        isReviewDue: false,
        judgement: {
          fingerprint: treeNow,
          verdict: StopVerdict.Blocked,
        },
      },
      marks: {
        [SessionMark.Turn]: treeBefore,
      },
    },
    {
      condition: 'the tree is as the turn began',
      expected: {
        isReviewDue: false,
        judgement: undefined,
      },
      marks: {
        [SessionMark.Turn]: treeNow,
      },
    },
    {
      condition: 'the checked tree was already reviewed',
      expected: {
        isReviewDue: false,
        judgement: undefined,
      },
      marks: {
        [SessionMark.Checked]: treeNow,
        [SessionMark.Reviewed]: treeNow,
      },
    },
    {
      condition: 'a subagent stops on a checked tree',
      event: {
        event: HookEventName.SubagentStop,
        isHookActive: false,
        session: keptSession,
      },
      expected: {
        isReviewDue: false,
        judgement: undefined,
      },
      marks: {
        [SessionMark.Checked]: treeNow,
      },
    },
    {
      condition: 'the session stops on a checked tree not yet reviewed',
      expected: {
        isReviewDue: true,
      },
      marks: {
        [SessionMark.Checked]: treeNow,
      },
    },
    {
      condition: 'the session stops on a tree it blocked before',
      expected: {
        isReviewDue: true,
      },
      marks: {
        [SessionMark.Blocked]: treeNow,
      },
    },
  ])('should judge the stop when $condition', ({ expected, ...given }) => {
    // Arrange
    const input = {
      event: given.event ?? stop,
      marks: {
        ...noMarks,
        ...given.marks,
      },
      tree: given.tree ?? readTree,
      unjudged: given.unjudged,
    };

    // Act
    const call = StopJudgement.judge(input);

    // Assert
    expect(call).toStrictEqual(expected);
  });
});

describe('StopJudgement.reviewOf', () => {
  const state = sessionStateOf({
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

  it.each([
    {
      changed: [
        'src/b.ts',
        'src/ui/a.ts',
        'src/ui/c.ts',
      ],
      condition: 'the changed files fall under blocks',
      expected: {
        blocks: [
          BlockId.create('typescript'),
          BlockId.create('ui'),
        ],
        verdict: StopVerdict.Review,
      },
    },
    {
      changed: [
        'README.md',
      ],
      condition: 'no block governs the changed files',
      expected: undefined,
    },
  ])('should ask for a review of each block once when $condition', ({ changed, expected }) => {
    // Arrange
    const given = {
      changed: changed.map(RepositoryRelativePath.create),
      state,
    };

    // Act
    const judgement = StopJudgement.reviewOf(given);

    // Assert
    expect(judgement).toStrictEqual(expected);
  });
});

describe('StopJudgement.recordOf', () => {
  it.each<{
    expected: ReturnType<typeof StopJudgement.recordOf>;
    judgement: StopJudgement;
  }>([
    {
      expected: {
        fingerprint: treeNow,
        mark: SessionMark.Reviewed,
      },
      judgement: {
        fingerprint: treeNow,
        verdict: StopVerdict.Reviewed,
      },
    },
    {
      expected: {
        fingerprint: treeNow,
        mark: SessionMark.Blocked,
      },
      judgement: {
        fingerprint: treeNow,
        verdict: StopVerdict.Blocked,
      },
    },
    {
      expected: {
        mark: SessionMark.Unjudged,
        reason: 'fatal: bad config',
      },
      judgement: {
        reason: 'fatal: bad config',
        verdict: StopVerdict.Unjudged,
      },
    },
    {
      expected: undefined,
      judgement: {
        blocks: [
          BlockId.create('ui'),
        ],
        verdict: StopVerdict.Review,
      },
    },
  ])(
    'should give what the session records of a $judgement.verdict judgement',
    ({ expected, judgement }) => {
      // Act
      const record = StopJudgement.recordOf(judgement);

      // Assert
      expect(record).toStrictEqual(expected);
    },
  );
});
