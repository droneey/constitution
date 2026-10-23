import { describe, expect, it } from 'bun:test';

import type { StopEvent, StopJudgement } from '../../../../../domain/entities';
import { SessionMark, StopVerdict } from '../../../../../domain/entities';
import { commandLineOf, createFakeCommandRun } from '../../../../__tests__/command-line.fake';
import { createStopCommand } from '../stop.cli';

interface Recorded {
  mark: SessionMark;
  session: string;
  value: string;
}

describe('createStopCommand', () => {
  it.each([
    {
      condition: 'the agent may stop',
      judgement: undefined,
      marks: [],
      written: [],
    },
    {
      condition: 'the reviewer finished',
      judgement: {
        fingerprint: 'f00d',
        verdict: StopVerdict.Reviewed,
      },
      marks: [
        {
          mark: SessionMark.Reviewed,
          session: 'session-1',
          value: 'f00d',
        },
      ],
      written: [],
    },
    {
      condition: 'the tree changed since the check passed',
      judgement: {
        check: 'bun run "check"',
        fingerprint: 'beef',
        verdict: StopVerdict.Blocked,
      },
      marks: [
        {
          mark: SessionMark.Blocked,
          session: 'session-1',
          value: 'beef',
        },
      ],
      written: [
        '{"decision":"block","reason":"The tree changed since the check last passed. Run the project\'s check, `bun run \\"check\\"`, and hand back only when it passes."}\n',
      ],
    },
    {
      condition: 'the changed files fall under blocks not reviewed',
      judgement: {
        blocks: [
          'ui',
          'react "19"',
        ],
        verdict: StopVerdict.Review,
      },
      marks: [],
      written: [
        '{"systemMessage":"Changed files fall under ui, react \\"19\\"; /check edits reviews them against the rules."}\n',
      ],
    },
  ])(
    'should hold the hand-back by the judgement when $condition',
    async ({ judgement, marks, written }) => {
      // Arrange
      const fake = createFakeCommandRun({
        stdin:
          '{"session_id":"session-1","hook_event_name":"SubagentStop","agent_type":"reviewer","agent_name":"constitution:reviewer","stop_hook_active":"true"}',
      });
      let judged: readonly StopEvent[] = [];
      let recorded: readonly Recorded[] = [];
      const cli = await commandLineOf(
        createStopCommand({
          ...fake.run,
          judgeStop: (event: StopEvent): StopJudgement | undefined => {
            judged = [
              ...judged,
              event,
            ];

            return judgement;
          },
          recordMark: (mark: Recorded): void => {
            recorded = [
              ...recorded,
              mark,
            ];
          },
        }),
      );

      // Act
      await cli.run([
        'stop',
      ]);

      // Assert
      expect({
        judged,
        record: fake.record(),
        recorded,
      }).toStrictEqual({
        judged: [
          {
            agentName: 'constitution:reviewer',
            agentType: 'reviewer',
            event: 'SubagentStop',
            isHookActive: 'true',
            session: 'session-1',
          },
        ],
        record: {
          errors: [],
          failures: 0,
          prefixes: [
            'constitution hook',
          ],
          written,
        },
        recorded: marks,
      });
    },
  );
});
