import { describe, expect, it } from 'bun:test';

import { createFakeWorkingTree } from '#/__tests__/working-tree.fake';
import { BlockId } from '#/kernel/value-objects';

import {
  activeBlockOf,
  heldSessionsOf,
  keptSession,
  sessionStateOf,
} from '../../../../../__tests__/session.fixtures';
import { createFakeSessionQueryRepository } from '../../../../../__tests__/session-query-repository.fake';
import type { StopEvent } from '../../../../entities';
import { CheckState, HookEventName, SessionMark, StopVerdict } from '../../../../entities';
import { SessionId } from '../../../../value-objects';
import { judgeStop } from '../judge-stop.use-case';

// The tree's state reads "hello", whose POSIX cksum is 3287646509.
const TREE = 'hello';
const NOW = '3287646509';
const EARLIER = '4294967295';

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
const changedFiles = [
  'src/b.ts',
  'src/ui/a.ts',
  'src/ui/c.ts',
];

describe('judgeStop', () => {
  it.each<{
    agent: Pick<StopEvent, 'agentName' | 'agentType'>;
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
        state: TREE,
      }),
    });

    // Assert
    expect(judgement).toStrictEqual({
      fingerprint: NOW,
      verdict: StopVerdict.Reviewed,
    });
  });

  it.each<{
    agent: Pick<StopEvent, 'agentType'>;
    condition: string;
    event: HookEventName;
    marks: readonly {
      mark: SessionMark;
      value: string;
    }[];
  }>([
    {
      agent: {
        agentType: 'constitution:reviewer',
      },
      condition: 'the reviewer is named at the end of the main session',
      event: HookEventName.Stop,
      marks: [],
    },
    {
      agent: {},
      condition: 'the check last passed, and the gate last blocked, on another tree',
      event: HookEventName.SubagentStop,
      marks: [
        {
          mark: SessionMark.Checked,
          value: EARLIER,
        },
        {
          mark: SessionMark.Blocked,
          value: EARLIER,
        },
        {
          mark: SessionMark.Turn,
          value: EARLIER,
        },
      ],
    },
  ])(
    'should block the hand-back until the check passes when $condition',
    ({ agent, event, marks }) => {
      // Arrange
      const sessions = createFakeSessionQueryRepository(
        heldSessionsOf({
          marks,
          state: savedState,
        }),
      );

      // Act
      const judgement = judgeStop({
        ...agent,
        event,
        isHookActive: false,
        session: keptSession,
        sessions,
        workingTree: createFakeWorkingTree({
          changed: changedFiles,
          state: TREE,
        }),
      });

      // Assert
      expect(judgement).toStrictEqual({
        check: 'bun run check',
        fingerprint: NOW,
        verdict: StopVerdict.Blocked,
      });
    },
  );

  it.each([
    {
      condition: 'the check passed on the tree',
      marks: [
        {
          mark: SessionMark.Checked,
          value: NOW,
        },
      ],
      state: savedState,
    },
    {
      condition: 'the gate blocked the tree before',
      marks: [
        {
          mark: SessionMark.Blocked,
          value: NOW,
        },
        {
          mark: SessionMark.Reviewed,
          value: EARLIER,
        },
      ],
      state: savedState,
    },
    {
      condition: 'the project names no check',
      marks: [],
      state: sessionStateOf({
        ...savedState,
        check: CheckState.create(),
      }),
    },
    {
      condition: 'constitution.yaml did not parse',
      marks: [],
      state: sessionStateOf({
        ...savedState,
        check: CheckState.unparsed(),
      }),
    },
  ])(
    'should ask for a review of the blocks the changed files fall under when $condition',
    ({ marks, state }) => {
      // Arrange
      const sessions = createFakeSessionQueryRepository(
        heldSessionsOf({
          marks,
          state,
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
          state: TREE,
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
          value: NOW,
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
          value: NOW,
        },
        {
          mark: SessionMark.Reviewed,
          value: NOW,
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
          value: NOW,
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
          value: NOW,
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
        state: TREE,
      }),
    });

    // Assert
    expect(judgement).toBeUndefined();
  });

  it('should judge nothing when the session kept no state', () => {
    // Arrange
    const sessions = createFakeSessionQueryRepository(
      heldSessionsOf({
        state: savedState,
      }),
    );

    // Act
    const judgement = judgeStop({
      agentType: 'constitution:reviewer',
      event: HookEventName.SubagentStop,
      isHookActive: false,
      session: SessionId.create('session-2'),
      sessions,
      workingTree: createFakeWorkingTree({
        changed: changedFiles,
        state: TREE,
      }),
    });

    // Assert
    expect(judgement).toBeUndefined();
  });
});
