import { describe, expect, it } from 'bun:test';

import { activeBlockOf, SESSION, sessionStateOf } from '../../../../../__tests__/session.fixtures';
import { createFakeWorkingTree } from '../../../../../__tests__/working-tree.fake';
import { SessionMark, StopVerdict } from '../../../../entities';
import { createFakeSessionQueries } from '../../__tests__/session-queries.fake';
import { judgeStop } from '../judge-stop.use-case';

// The tree's state reads "hello", whose POSIX cksum is 3287646509.
const TREE = 'hello';
const NOW = '3287646509';
const EARLIER = '4294967295';

const STATE = sessionStateOf({
  active: [
    activeBlockOf({
      globs: [
        '**/ui/**',
      ],
      id: 'ui',
    }),
    activeBlockOf({
      globs: [
        '**/*.ts',
      ],
      id: 'typescript',
    }),
  ],
});
const CHANGED = [
  'src/b.ts',
  'src/ui/a.ts',
  'src/ui/c.ts',
];

describe('judgeStop', () => {
  it.each([
    {
      agentName: '',
      agentType: 'constitution:reviewer',
      condition: 'the reviewer, by its type, stops while a hook is active',
      isHookActive: 'true',
    },
    {
      agentName: 'constitution:reviewer',
      agentType: 'general-purpose',
      condition: 'the reviewer, by its name, stops',
      isHookActive: 'false',
    },
  ])(
    'should record the tree it reviewed when $condition',
    ({ agentName, agentType, isHookActive }) => {
      // Arrange
      const sessions = createFakeSessionQueries({
        state: STATE,
      });

      // Act
      const judgement = judgeStop({
        agentName,
        agentType,
        event: 'SubagentStop',
        isHookActive,
        session: SESSION,
        sessions: sessions,
        workingTree: createFakeWorkingTree({
          changed: CHANGED,
          state: TREE,
        }),
      });

      // Assert
      expect(judgement).toStrictEqual({
        fingerprint: NOW,
        verdict: StopVerdict.Reviewed,
      });
    },
  );

  it.each([
    {
      agentType: 'constitution:reviewer',
      condition: 'the reviewer is named at the end of the main session',
      event: 'Stop',
      marks: [],
    },
    {
      agentType: '',
      condition: 'the check last passed, and the gate last blocked, on another tree',
      event: 'SubagentStop',
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
    ({ agentType, event, marks }) => {
      // Arrange
      const sessions = createFakeSessionQueries({
        marks,
        state: STATE,
      });

      // Act
      const judgement = judgeStop({
        agentName: '',
        agentType,
        event,
        isHookActive: 'false',
        session: SESSION,
        sessions: sessions,
        workingTree: createFakeWorkingTree({
          changed: CHANGED,
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
      state: STATE,
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
      state: STATE,
    },
    {
      condition: 'the project names no check',
      marks: [],
      state: sessionStateOf({
        ...STATE,
        check: '',
      }),
    },
    {
      condition: 'constitution.yaml did not parse',
      marks: [],
      state: {
        active: STATE.active,
        musts: [],
        project: '/work/project',
      },
    },
  ])(
    'should ask for a review of the blocks the changed files fall under when $condition',
    ({ marks, state }) => {
      // Arrange
      const sessions = createFakeSessionQueries({
        marks,
        state,
      });

      // Act
      const judgement = judgeStop({
        agentName: '',
        agentType: '',
        event: 'Stop',
        isHookActive: 'false',
        session: SESSION,
        sessions: sessions,
        workingTree: createFakeWorkingTree({
          changed: CHANGED,
          state: TREE,
        }),
      });

      // Assert
      expect(judgement).toStrictEqual({
        blocks: [
          'typescript',
          'ui',
        ],
        verdict: StopVerdict.Review,
      });
    },
  );

  it.each([
    {
      changed: CHANGED,
      condition: 'a stop hook is already active',
      event: 'Stop',
      isHookActive: 'true',
      marks: [],
    },
    {
      changed: CHANGED,
      condition: 'the turn changed nothing',
      event: 'Stop',
      isHookActive: 'false',
      marks: [
        {
          mark: SessionMark.Turn,
          value: NOW,
        },
      ],
    },
    {
      changed: CHANGED,
      condition: 'the reviewer reviewed the tree',
      event: 'Stop',
      isHookActive: 'false',
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
      changed: CHANGED,
      condition: 'a subagent stops after the check passed',
      event: 'SubagentStop',
      isHookActive: 'false',
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
      event: 'Stop',
      isHookActive: 'false',
      marks: [
        {
          mark: SessionMark.Checked,
          value: NOW,
        },
      ],
    },
  ])('should let the agent stop when $condition', ({ changed, event, isHookActive, marks }) => {
    // Arrange
    const sessions = createFakeSessionQueries({
      marks,
      state: STATE,
    });

    // Act
    const judgement = judgeStop({
      agentName: '',
      agentType: '',
      event,
      isHookActive,
      session: SESSION,
      sessions: sessions,
      workingTree: createFakeWorkingTree({
        changed,
        state: TREE,
      }),
    });

    // Assert
    expect(judgement).toBeUndefined();
  });

  it.each([
    {
      condition: 'the session is not a plain name',
      session: 'x/y',
      state: STATE,
    },
    {
      condition: 'the session kept no state',
      session: 'session-2',
      state: STATE,
    },
    {
      condition: 'the state names no project',
      session: SESSION,
      state: sessionStateOf({
        ...STATE,
        project: '',
      }),
    },
  ])('should judge nothing when $condition', ({ session, state }) => {
    // Arrange
    const sessions = createFakeSessionQueries({
      states: {
        [SESSION]: state,
        'x/y': state,
      },
    });

    // Act
    const judgement = judgeStop({
      agentName: '',
      agentType: 'constitution:reviewer',
      event: 'SubagentStop',
      isHookActive: 'false',
      session,
      sessions: sessions,
      workingTree: createFakeWorkingTree({
        changed: CHANGED,
        state: TREE,
      }),
    });

    // Assert
    expect(judgement).toBeUndefined();
  });
});
