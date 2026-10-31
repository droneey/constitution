import { describe, expect, it } from 'bun:test';

import { createFakeContext, runCommand } from '#/__tests__/command-context.fake';
import { projectCheck } from '#/kernel/constants';
import { AbsolutePath, BlockId } from '#/kernel/value-objects';

import type {
  AgentInSession,
  GateVerdict,
  ReviewDebt,
  StopEvent,
  StopJudgement,
} from '../../../../../domain/entities';
import {
  GateCauseKind,
  GateVerdictKind,
  HandBackStep,
  HookEventName,
  SessionAgent,
  StopVerdict,
} from '../../../../../domain/entities';
import { AgentId, SessionId, TreeFingerprint } from '../../../../../domain/value-objects';
import { actionsText, passesToldMessage, turnAnswerOf } from '../../../../utils';
import { createStopCommand } from '../stop.cli';
import {
  checkAndReviewMessage,
  checkMessage,
  reviewMessage,
  subagentChangesMessage,
  unjudgedMessage,
} from '../stop.messages';

const CLAUDE_CODE_TEXT_CAP = 10_000;

interface Judged {
  agent: SessionAgent;
  judgement: StopJudgement;
  session: SessionId;
}

interface Recorded extends Judged {
  askedBefore: number;
}

interface HeldAsked {
  agent: SessionAgent;
  fingerprint: TreeFingerprint;
  missing: readonly HandBackStep[];
  session: SessionId;
}

const STDIN =
  '{"session_id":"s1","hook_event_name":"SubagentStop","agent_id":"agent-1","agent_type":"Explore","agent_name":"helper","stop_hook_active":true}';

const answerOf = (stdout: string): unknown => (stdout === '' ? undefined : JSON.parse(stdout));

interface TurnGate {
  readonly isHeld?: boolean;
  readonly passes?: number;
  readonly turn?: GateVerdict;
}

interface TurnAsked extends AgentInSession {
  readonly isHookActive: boolean;
}

const runOf = async (
  judgement: StopJudgement | undefined,
  stdin: string = STDIN,
  gate: TurnGate = {},
): Promise<{
  asked: StopEvent[];
  handed: AgentInSession[];
  held: HeldAsked[];
  recorded: Recorded[];
  stdout: string;
  told: AgentInSession[];
  turns: TurnAsked[];
}> => {
  const asked: StopEvent[] = [];
  const told: AgentInSession[] = [];
  const turns: TurnAsked[] = [];
  const handed: AgentInSession[] = [];
  const held: HeldAsked[] = [];
  const recorded: Recorded[] = [];
  const { context, record } = createFakeContext({
    stdin,
  });

  await runCommand({
    args: [],
    command: createStopCommand({
      ...context,
      gateTurn: (turn: TurnAsked): GateVerdict => {
        turns.push(turn);

        return (
          gate.turn ?? {
            kind: GateVerdictKind.Allowed,
          }
        );
      },
      handOverChanges: (handing: AgentInSession): void => {
        handed.push(handing);
      },
      holdHandBack: (holding: HeldAsked): boolean => {
        held.push(holding);

        return gate.isHeld ?? true;
      },
      judgeStop: (event: StopEvent): StopJudgement | undefined => {
        asked.push(event);

        return judgement;
      },
      recordJudgement: (judged: Judged): void => {
        recorded.push({
          ...judged,
          askedBefore: asked.length,
        });
      },
      tellPasses: (telling: AgentInSession): number => {
        told.push(telling);

        return gate.passes ?? 0;
      },
    }),
    group: 'hook',
  });

  return {
    asked,
    handed,
    held,
    recorded,
    stdout: record().stdout,
    told,
    turns,
  };
};

const heldOf = (
  missing: readonly HandBackStep[],
  subagentChanges: readonly ReviewDebt[] = [],
): StopJudgement => ({
  blocks: [
    BlockId.create('typescript'),
    BlockId.create('ui'),
  ],
  fingerprint: TreeFingerprint.create('tree'),
  missing,
  subagentChanges,
  verdict: StopVerdict.Blocked,
});

describe('createStopCommand', () => {
  it("should hand the gate the event as Claude Code names it, record nothing it did not judge, and hand the subagent's changes over", async () => {
    // Arrange
    const judgement = undefined;

    // Act
    const run = await runOf(judgement);

    // Assert
    expect(run).toStrictEqual({
      asked: [
        {
          agent: AgentId.create('agent-1'),
          agentName: 'helper',
          agentType: 'Explore',
          event: HookEventName.SubagentStop,
          isHookActive: true,
          session: SessionId.create('s1'),
        },
      ],
      handed: [
        {
          agent: AgentId.create('agent-1'),
          session: SessionId.create('s1'),
        },
      ],
      held: [],
      recorded: [],
      stdout: '',
      told: [
        {
          agent: AgentId.create('agent-1'),
          session: SessionId.create('s1'),
        },
      ],
      turns: [
        {
          agent: AgentId.create('agent-1'),
          isHookActive: true,
          session: SessionId.create('s1'),
        },
      ],
    });
  });

  it.each([
    {
      condition: "a subagent's stop names no agent",
      stdin: '{"session_id":"s1","hook_event_name":"SubagentStop"}',
    },
    {
      condition: "the main session's stop names an agent",
      stdin: '{"session_id":"s1","hook_event_name":"Stop","agent_id":"agent-1"}',
    },
  ])(
    'should gate, judge and tell nothing, and write nothing, when $condition',
    async ({ stdin }) => {
      // Arrange
      const judgement = undefined;

      // Act
      const run = await runOf(judgement, stdin, {
        passes: 1,
        turn: {
          causes: [],
          kind: GateVerdictKind.Closed,
        },
      });

      // Assert
      expect(run).toStrictEqual({
        asked: [],
        handed: [],
        held: [],
        recorded: [],
        stdout: '',
        told: [],
        turns: [],
      });
    },
  );

  it('should hand the gate no agent when the main session stops, though the event names one', async () => {
    // Arrange
    const judgement = undefined;
    const stdin =
      '{"session_id":"s1","hook_event_name":"Stop","agent_type":"constitution:reviewer","agent_name":"constitution:reviewer"}';

    // Act
    const run = await runOf(judgement, stdin);

    // Assert
    expect({
      asked: run.asked,
      handed: run.handed,
    }).toStrictEqual({
      asked: [
        {
          agent: SessionAgent.main,
          event: HookEventName.Stop,
          isHookActive: false,
          session: SessionId.create('s1'),
        },
      ],
      handed: [],
    });
  });

  it("should hand the gate the subagent's stop when it names neither the agent's name nor its type", async () => {
    // Arrange
    const judgement = undefined;
    const stdin = '{"session_id":"s1","hook_event_name":"SubagentStop","agent_id":"agent-1"}';

    // Act
    const run = await runOf(judgement, stdin);

    // Assert
    expect(run.asked).toStrictEqual([
      {
        agent: AgentId.create('agent-1'),
        event: HookEventName.SubagentStop,
        isHookActive: false,
        session: SessionId.create('s1'),
      },
    ]);
  });

  it.each([
    {
      condition: 'names no agent and an event it does not know',
      stdin: '{"session_id":"s1","hook_event_name":"Notification"}',
    },
    {
      condition: 'names its agent and its event as empty texts',
      stdin: '{"session_id":"s1","hook_event_name":"","agent_type":"","agent_name":""}',
    },
  ])("should hand the gate the main agent's stop when the event $condition", async ({ stdin }) => {
    // Arrange
    const judgement = undefined;

    // Act
    const run = await runOf(judgement, stdin);

    // Assert
    expect(run.asked).toStrictEqual([
      {
        agent: SessionAgent.main,
        event: HookEventName.Stop,
        isHookActive: false,
        session: SessionId.create('s1'),
      },
    ]);
  });

  it.each([
    {
      condition: 'the session id is no plain name',
      stdin: '{"session_id":"x/y","hook_event_name":"Stop"}',
    },
    {
      condition: 'the event names no session',
      stdin: '{"hook_event_name":"Stop"}',
    },
  ])('should ask the gate nothing, and write nothing, when $condition', async ({ stdin }) => {
    // Arrange
    const judgement: StopJudgement = {
      fingerprint: TreeFingerprint.create('1'),
      verdict: StopVerdict.Reviewed,
    };

    // Act
    const run = await runOf(judgement, stdin);

    // Assert
    expect(run).toStrictEqual({
      asked: [],
      handed: [],
      held: [],
      recorded: [],
      stdout: '',
      told: [],
      turns: [],
    });
  });

  it.each<{
    answer: object | undefined;
    condition: string;
    judgement: StopJudgement;
  }>([
    {
      answer: {
        decision: 'block',
        reason: checkMessage(projectCheck),
      },
      condition: 'the tree changed since the check last passed',
      judgement: heldOf([
        HandBackStep.Check,
      ]),
    },
    {
      answer: {
        decision: 'block',
        reason: reviewMessage('typescript, ui'),
      },
      condition: 'no review covers the changed files',
      judgement: heldOf([
        HandBackStep.Review,
      ]),
    },
    {
      answer: {
        decision: 'block',
        reason: checkAndReviewMessage({
          blocks: 'typescript, ui',
          check: projectCheck,
        }),
      },
      condition: 'the tree has neither the check nor the review',
      judgement: heldOf([
        HandBackStep.Check,
        HandBackStep.Review,
      ]),
    },
    {
      answer: {
        systemMessage: unjudgedMessage('fatal: bad config'),
      },
      condition: 'git fails to report the tree',
      judgement: {
        reason: 'fatal: bad config',
        verdict: StopVerdict.Unjudged,
      },
    },
    {
      answer: undefined,
      condition: "the check and the review cover the agent's own changes",
      judgement: {
        subagentChanges: [],
        verdict: StopVerdict.Covered,
      },
    },
    {
      answer: undefined,
      condition: 'the reviewer finished',
      judgement: {
        fingerprint: TreeFingerprint.create('1'),
        verdict: StopVerdict.Reviewed,
      },
    },
  ])(
    'should record the judgement, then answer the gate, when $condition',
    async ({ answer, judgement }) => {
      // Act
      const run = await runOf(judgement);

      // Assert
      expect({
        answer: answerOf(run.stdout),
        recorded: run.recorded,
      }).toStrictEqual({
        answer,
        recorded: [
          {
            agent: AgentId.create('agent-1'),
            askedBefore: 1,
            judgement,
            session: SessionId.create('s1'),
          },
        ],
      });
    },
  );
  it.each<{
    condition: string;
    turn: GateVerdict;
  }>([
    {
      condition: 'the agent owes rules for what it read',
      turn: {
        shouldIgnoreParts: false,
        changedByCommands: [],
        kind: GateVerdictKind.Refused,
        parts: [
          AbsolutePath.create('/work/.droneey/constitution-sessions/s1/parts/abc.1.md'),
        ],
        unreadCount: 2,
      },
    },
    {
      condition: 'the Constitution the project declares cannot be read',
      turn: {
        causes: [
          {
            kind: GateCauseKind.Failed,
            reason: 'the release cannot be listed',
          },
        ],
        kind: GateVerdictKind.Closed,
      },
    },
  ])('should hold the turn, and judge no tree, when $condition', async ({ turn }) => {
    // Act
    const run = await runOf(undefined, STDIN, {
      turn,
    });

    // Assert
    expect({
      answer: answerOf(run.stdout),
      asked: run.asked,
    }).toStrictEqual({
      answer: turnAnswerOf(turn),
      asked: [],
    });
  });

  it('should tell the passes beside a held hand-back', async () => {
    // Act
    const run = await runOf(
      heldOf([
        HandBackStep.Check,
      ]),
      STDIN,
      {
        passes: 2,
      },
    );

    // Assert
    expect(answerOf(run.stdout)).toStrictEqual({
      decision: 'block',
      reason: checkMessage(projectCheck),
      systemMessage: passesToldMessage(actionsText.many(2)),
    });
  });

  it('should let the agent hand back once the hand-back was held three times, and tell it', async () => {
    // Act
    const run = await runOf(
      heldOf([
        HandBackStep.Check,
        HandBackStep.Review,
      ]),
      STDIN,
      {
        isHeld: false,
        passes: 1,
      },
    );

    // Assert
    expect(answerOf(run.stdout)).toStrictEqual({
      systemMessage: passesToldMessage(actionsText.one),
    });
  });

  it('should tell the passes alone when the hand-back gate lets the agent stop', async () => {
    // Arrange
    const judgement = undefined;

    // Act
    const run = await runOf(judgement, STDIN, {
      passes: 1,
    });

    // Assert
    expect(answerOf(run.stdout)).toStrictEqual({
      systemMessage: passesToldMessage(actionsText.one),
    });
  });

  it('should tell the passes after what the hand-back gate tells', async () => {
    // Arrange
    const judgement: StopJudgement = {
      reason: 'fatal: bad config',
      verdict: StopVerdict.Unjudged,
    };

    // Act
    const run = await runOf(judgement, STDIN, {
      passes: 1,
    });

    // Assert
    expect(answerOf(run.stdout)).toStrictEqual({
      systemMessage: [
        unjudgedMessage('fatal: bad config'),
        passesToldMessage(actionsText.one),
      ].join('\n'),
    });
  });

  it('should judge nothing when the agent id is no plain name', async () => {
    // Arrange
    const stdin = '{"session_id":"s1","hook_event_name":"SubagentStop","agent_id":"../x"}';

    // Act
    const run = await runOf(undefined, stdin);

    // Assert
    expect(run).toStrictEqual({
      asked: [],
      handed: [],
      held: [],
      recorded: [],
      stdout: '',
      told: [],
      turns: [],
    });
  });
  it('should hand the gate the subagent that stops, by its id, so it answers for its own changes', async () => {
    // Arrange
    const stdin =
      '{"session_id":"s1","hook_event_name":"SubagentStop","agent_id":"agent-1","agent_type":"general-purpose"}';

    // Act
    const run = await runOf(undefined, stdin);

    // Assert
    expect(run.asked).toStrictEqual([
      {
        agent: AgentId.create('agent-1'),
        agentType: 'general-purpose',
        event: HookEventName.SubagentStop,
        isHookActive: false,
        session: SessionId.create('s1'),
      },
    ]);
  });
  it('should name each subagent whose work the coordinator reviews, then the review it lacks', async () => {
    // Arrange
    const judgement = heldOf(
      [
        HandBackStep.Review,
      ],
      [
        {
          agent: AgentId.create('agent-1'),
          path: AbsolutePath.create('/work/src/a.ts'),
        },
        {
          agent: AgentId.create('agent-1'),
          path: AbsolutePath.create('/work/src/b.ts'),
        },
      ],
    );

    // Act
    const run = await runOf(judgement, '{"session_id":"s1","hook_event_name":"Stop"}');

    // Assert
    expect({
      answer: answerOf(run.stdout),
      namesAgent: run.stdout.includes('agent-1'),
      namesPaths: run.stdout.includes('/work/src/a.ts, /work/src/b.ts'),
    }).toStrictEqual({
      answer: {
        decision: 'block',
        reason: [
          subagentChangesMessage({
            agent: 'agent-1',
            paths: '/work/src/a.ts, /work/src/b.ts',
          }),
          reviewMessage('typescript, ui'),
        ].join('\n'),
      },
      namesAgent: true,
      namesPaths: true,
    });
  });

  it('should ask to hold the hand-back of the agent by the tree it judged and the steps it misses', async () => {
    // Arrange
    const judgement = heldOf([
      HandBackStep.Check,
    ]);

    // Act
    const run = await runOf(judgement, '{"session_id":"s1","hook_event_name":"Stop"}');

    // Assert
    expect(run.held).toStrictEqual([
      {
        agent: SessionAgent.main,
        fingerprint: TreeFingerprint.create('tree'),
        missing: [
          HandBackStep.Check,
        ],
        session: SessionId.create('s1'),
      },
    ]);
  });

  it.each<{
    condition: string;
    handed: number;
    judgement: StopJudgement | undefined;
  }>([
    {
      condition: 'its hand-back goes through',
      handed: 1,
      judgement: undefined,
    },
    {
      condition: 'its hand-back is held',
      handed: 0,
      judgement: heldOf([
        HandBackStep.Check,
      ]),
    },
  ])(
    "should hand a subagent's own changes to the coordinator $handed times when $condition",
    async ({ handed, judgement }) => {
      // Act
      const run = await runOf(
        judgement,
        '{"session_id":"s1","hook_event_name":"SubagentStop","agent_id":"agent-1"}',
      );

      // Assert
      expect(run.handed.length).toBe(handed);
    },
  );

  it.each([
    {
      isHookActive: true,
      stdin: '{"session_id":"s1","hook_event_name":"Stop","stop_hook_active":true}',
    },
    {
      isHookActive: false,
      stdin: '{"session_id":"s1","hook_event_name":"Stop"}',
    },
  ])(
    'should ask the turn gate with the stop hook active $isHookActive',
    async ({ isHookActive, stdin }) => {
      // Act
      const run = await runOf(undefined, stdin);

      // Assert
      expect(run.turns).toStrictEqual([
        {
          agent: SessionAgent.main,
          isHookActive,
          session: SessionId.create('s1'),
        },
      ]);
    },
  );

  it("should keep its reason within Claude Code's cap when many subagents changed many files under many blocks", async () => {
    // Arrange
    const judgement: StopJudgement = {
      blocks: Array.from(
        {
          length: 300,
        },
        (_, index) => BlockId.create(`block-of-a-long-name-${index}`),
      ),
      fingerprint: TreeFingerprint.create('tree'),
      missing: [
        HandBackStep.Check,
        HandBackStep.Review,
      ],
      subagentChanges: Array.from(
        {
          length: 3000,
        },
        (_, index) => ({
          agent: AgentId.create(`agent-${index % 60}`),
          path: AbsolutePath.create(`/work/src/a-folder-of-some-depth/file-${index}.ts`),
        }),
      ),
      verdict: StopVerdict.Blocked,
    };

    // Act
    const run = await runOf(judgement, '{"session_id":"s1","hook_event_name":"Stop"}', {
      passes: 3,
    });

    // Assert
    expect(run.stdout.length < CLAUDE_CODE_TEXT_CAP).toBe(true);
  });

  it('should tell how many actions the gates let through', async () => {
    // Act
    const run = await runOf(undefined, STDIN, {
      passes: 7,
    });

    // Assert
    expect(run.stdout.includes('7')).toBe(true);
  });

  it.each([
    {
      condition: 'subagents it leaves out',
      count: '42',
      judgement: heldOf(
        [
          HandBackStep.Review,
        ],
        Array.from(
          {
            length: 60,
          },
          (_, index) => ({
            agent: AgentId.create(`agent-${String(index).padStart(2, '0')}`),
            path: AbsolutePath.create(`/work/src/a-folder-of-some-depth/file-${index}.ts`),
          }),
        ),
      ),
    },
    {
      condition: 'blocks it leaves out',
      count: '100',
      judgement: {
        ...heldOf([
          HandBackStep.Review,
        ]),
        blocks: Array.from(
          {
            length: 400,
          },
          (_, index) => BlockId.create(`b${String(index).padStart(3, '0')}`),
        ),
      },
    },
  ])('should tell how many $condition', async ({ count, judgement }) => {
    // Act
    const run = await runOf(judgement, '{"session_id":"s1","hook_event_name":"Stop"}');

    // Assert
    expect(run.stdout.includes(`${count} more`)).toBe(true);
  });
});
