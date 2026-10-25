import { describe, expect, it } from 'bun:test';

import { createFakeContext, runCommand } from '#/__tests__/command-context.fake';
import { BlockId } from '#/kernel/value-objects';

import type { StopEvent, StopJudgement } from '../../../../../domain/entities';
import { HookEventName, StopVerdict } from '../../../../../domain/entities';
import { SessionId } from '../../../../../domain/value-objects';
import { createStopCommand } from '../stop.cli';

interface Judged {
  judgement: StopJudgement;
  session: SessionId;
}

interface Recorded extends Judged {
  askedBefore: number;
}

const STDIN =
  '{"session_id":"s1","hook_event_name":"SubagentStop","agent_type":"Explore","agent_name":"helper","stop_hook_active":true}';

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
      fingerprint: '1',
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

  it.each([
    {
      condition: 'the tree changed since the check last passed',
      judgement: {
        check: 'bun run "check"',
        fingerprint: '1',
        verdict: StopVerdict.Blocked,
      },
      stdout:
        '{"decision":"block","reason":"The tree changed since the check last passed. Run the project\'s check, `bun run \\"check\\"`, and hand back only when it passes."}\n',
    },
    {
      condition: 'the changed files call for a review',
      judgement: {
        blocks: [
          BlockId.create('typescript'),
          BlockId.create('ui'),
        ],
        verdict: StopVerdict.Review,
      },
      stdout:
        '{"systemMessage":"Changed files fall under typescript, ui; /check edits reviews them against the rules."}\n',
    },
    {
      condition: 'the reviewer finished',
      judgement: {
        fingerprint: '1',
        verdict: StopVerdict.Reviewed,
      },
      stdout: '',
    },
  ])(
    'should record the judgement, then answer the gate, when $condition',
    async ({ judgement, stdout }) => {
      // Act
      const run = await runOf(judgement);

      // Assert
      expect({
        recorded: run.recorded,
        stdout: run.stdout,
      }).toStrictEqual({
        recorded: [
          {
            askedBefore: 1,
            judgement,
            session: SessionId.create('s1'),
          },
        ],
        stdout,
      });
    },
  );
});
