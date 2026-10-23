import { describe, expect, it } from 'bun:test';

import { SessionMark } from '../../../../../domain/entities';
import { commandLineOf, createFakeCommandRun } from '../../../../__tests__/command-line.fake';
import { createRecordCheckCommand } from '../record-check.cli';

interface Recorded {
  mark: SessionMark;
  session: string;
  value: string;
}

interface Judged {
  command: string;
  session: string;
}

describe('createRecordCheckCommand', () => {
  it.each([
    {
      condition: "the command was the project's check",
      fingerprint: 'f00d',
      marks: [
        {
          mark: SessionMark.Checked,
          session: 'session-1',
          value: 'f00d',
        },
      ],
    },
    {
      condition: 'the command was another',
      fingerprint: undefined,
      marks: [],
    },
  ])('should note the tree the check passed on when $condition', async ({ fingerprint, marks }) => {
    // Arrange
    const fake = createFakeCommandRun({
      stdin:
        '{"session_id":"session-1","tool_name":"Bash","tool_input":{"command":"bun run check"}}',
    });
    let judged: readonly Judged[] = [];
    let recorded: readonly Recorded[] = [];
    const cli = await commandLineOf(
      createRecordCheckCommand({
        ...fake.run,
        judgeCheckRun: (run: Judged): string | undefined => {
          judged = [
            ...judged,
            run,
          ];

          return fingerprint;
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
      'record-check',
    ]);

    // Assert
    expect({
      judged,
      record: fake.record(),
      recorded,
    }).toStrictEqual({
      judged: [
        {
          command: 'bun run check',
          session: 'session-1',
        },
      ],
      record: {
        errors: [],
        failures: 0,
        prefixes: [
          'constitution hook',
        ],
        written: [],
      },
      recorded: marks,
    });
  });
});
