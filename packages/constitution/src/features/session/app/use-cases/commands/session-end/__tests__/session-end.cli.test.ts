import { describe, expect, it } from 'bun:test';

import { createFakeContext, runCommand } from '#/__tests__/command-context.fake';

import { SessionId } from '../../../../../domain/value-objects';
import { createSessionEndCommand } from '../session-end.cli';

const runOf = async (
  stdin: string,
): Promise<{
  ended: SessionId[];
  stdout: string;
}> => {
  const ended: SessionId[] = [];
  const { context, record } = createFakeContext({
    stdin,
  });

  await runCommand({
    args: [],
    command: createSessionEndCommand({
      ...context,
      endSession: (session: SessionId): void => {
        ended.push(session);
      },
    }),
    group: 'hook',
  });

  return {
    ended,
    stdout: record().stdout,
  };
};

describe('createSessionEndCommand', () => {
  it('should end the session the event names, and write nothing', async () => {
    // Arrange
    const stdin = '{"session_id":"s1","hook_event_name":"SessionEnd","reason":"other"}';

    // Act
    const run = await runOf(stdin);

    // Assert
    expect(run).toStrictEqual({
      ended: [
        SessionId.create('s1'),
      ],
      stdout: '',
    });
  });

  it.each([
    {
      condition: 'the session id is no plain name',
      stdin: '{"session_id":"x/y","reason":"other"}',
    },
    {
      condition: 'the event names no session',
      stdin: '{"reason":"other"}',
    },
  ])('should end nothing, and write nothing, when $condition', async ({ stdin }) => {
    // Act
    const run = await runOf(stdin);

    // Assert
    expect(run).toStrictEqual({
      ended: [],
      stdout: '',
    });
  });
});
