import { describe, expect, it } from 'bun:test';

import { createFakeContext, runCommand } from '#/__tests__/command-context.fake';
import { projectCheck } from '#/kernel/constants';
import { BlockId } from '#/kernel/value-objects';

import type { StopEvent, StopJudgement } from '../../../../../domain/entities';
import { HookEventName, StopVerdict } from '../../../../../domain/entities';
import { SessionId, TreeFingerprint } from '../../../../../domain/value-objects';
import { createStopCommand } from '../stop.cli';
import { blockedMessage, reviewMessage, unjudgedMessage } from '../stop.messages';

interface Judged {
  judgement: StopJudgement;
  session: SessionId;
}

interface Recorded extends Judged {
  askedBefore: number;
}

const STDIN =
  '{"session_id":"s1","hook_event_name":"SubagentStop","agent_type":"Explore","agent_name":"helper","stop_hook_active":true}';

// What a run answered: the JSON it wrote, read back, or undefined when it wrote none.
const answerOf = (stdout: string): unknown => (stdout === '' ? undefined : JSON.parse(stdout));

const runOf = async (
  judgement: StopJudgement | undefined,
  stdin: string = STDIN,
): Promise<{
  asked: StopEvent[];
  recorded: Recorded[];
  stdout: string;
}> => {
  const asked: StopEvent[] = [];
  const recorded: Recorded[] = [];
  const { context, record } = createFakeContext({
    stdin,
  });

  await runCommand({
    args: [],
    command: createStopCommand({
      ...context,
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
    }),
    group: 'hook',
  });

  return {
    asked,
    recorded,
    stdout: record().stdout,
  };
};

describe('createStopCommand', () => {
  it('should hand the gate the event as Claude Code names it, and record nothing it did not judge', async () => {
    // Arrange
    const judgement = undefined;

    // Act
    const run = await runOf(judgement);

    // Assert
    expect(run).toStrictEqual({
      asked: [
        {
          agentName: 'helper',
          agentType: 'Explore',
          event: HookEventName.SubagentStop,
          isHookActive: true,
          session: SessionId.create('s1'),
        },
      ],
      recorded: [],
      stdout: '',
    });
  });

  it("should hand the gate no agent when a subagent's stop names none", async () => {
    // Arrange
    const judgement = undefined;
    const stdin = '{"session_id":"s1","hook_event_name":"SubagentStop"}';

    // Act
    const run = await runOf(judgement, stdin);

    // Assert
    expect(run.asked).toStrictEqual([
      {
        event: HookEventName.SubagentStop,
        isHookActive: false,
        session: SessionId.create('s1'),
      },
    ]);
  });

  it('should hand the gate no agent when the main session stops, though the event names one', async () => {
    // Arrange
    const judgement = undefined;
    const stdin =
      '{"session_id":"s1","hook_event_name":"Stop","agent_type":"constitution:reviewer","agent_name":"constitution:reviewer"}';

    // Act
    const run = await runOf(judgement, stdin);

    // Assert
    expect(run.asked).toStrictEqual([
      {
        event: HookEventName.Stop,
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
  ])(
    'should hand the gate no agent and an unknown event when the event $condition',
    async ({ stdin }) => {
      // Arrange
      const judgement = undefined;

      // Act
      const run = await runOf(judgement, stdin);

      // Assert
      expect(run.asked).toStrictEqual([
        {
          event: HookEventName.Unknown,
          isHookActive: false,
          session: SessionId.create('s1'),
        },
      ]);
    },
  );

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
      recorded: [],
      stdout: '',
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
        reason: blockedMessage(projectCheck),
      },
      condition: 'the tree changed since the check last passed',
      judgement: {
        fingerprint: TreeFingerprint.create('1'),
        verdict: StopVerdict.Blocked,
      },
    },
    {
      answer: {
        systemMessage: reviewMessage('typescript, ui'),
      },
      condition: 'the changed files call for a review',
      judgement: {
        blocks: [
          BlockId.create('typescript'),
          BlockId.create('ui'),
        ],
        verdict: StopVerdict.Review,
      },
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
            askedBefore: 1,
            judgement,
            session: SessionId.create('s1'),
          },
        ],
      });
    },
  );
});
