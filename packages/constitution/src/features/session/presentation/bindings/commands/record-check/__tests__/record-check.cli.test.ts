import { describe, expect, it } from 'bun:test';

import { createFakeContext, runCommand } from '#/__tests__/command-context.fake';

import { SessionId } from '../../../../../domain/session/value-objects';
import { createRecordCheckCommand } from '../record-check.cli';

interface Asked {
  command: string;
  isInBackground: boolean;
  session: SessionId;
}

const runOf = async (
  stdin: string,
): Promise<{
  asked: Asked[];
  stdout: string;
}> => {
  const asked: Asked[] = [];
  const { context, record } = createFakeContext({
    stdin,
  });

  await runCommand({
    args: [],
    command: createRecordCheckCommand({
      ...context,
      recordCheck: (run: Asked): void => {
        asked.push(run);
      },
    }),
    group: 'hook',
  });

  return {
    asked,
    stdout: record().stdout,
  };
};

describe('createRecordCheckCommand', () => {
  it.each([
    {
      condition: 'it ran to its end',
      isInBackground: false,
      stdin: '{"session_id":"s1","tool_input":{"command":"bun run check"}}',
    },
    {
      condition: 'it was started in the background',
      isInBackground: true,
      stdin:
        '{"session_id":"s1","tool_input":{"command":"bun run check","run_in_background":true}}',
    },
    {
      condition: 'it names its background flag by no boolean',
      isInBackground: false,
      stdin:
        '{"session_id":"s1","tool_input":{"command":"bun run check","run_in_background":"yes"}}',
    },
  ])(
    'should hand the command the agent ran, its session and whether $condition to the record, and write nothing',
    async ({ isInBackground, stdin }) => {
      // Act
      const run = await runOf(stdin);

      // Assert
      expect(run).toStrictEqual({
        asked: [
          {
            command: 'bun run check',
            isInBackground,
            session: SessionId.create('s1'),
          },
        ],
        stdout: '',
      });
    },
  );

  it.each([
    {
      condition: 'the session id is no plain name',
      stdin: '{"session_id":"x/y","tool_input":{"command":"bun run check"}}',
    },
    {
      condition: 'the event names no command',
      stdin: '{"session_id":"s1","tool_input":{}}',
    },
    {
      condition: 'the command is empty',
      stdin: '{"session_id":"s1","tool_input":{"command":""}}',
    },
  ])('should record nothing, and write nothing, when $condition', async ({ stdin }) => {
    // Act
    const run = await runOf(stdin);

    // Assert
    expect(run).toStrictEqual({
      asked: [],
      stdout: '',
    });
  });
});
