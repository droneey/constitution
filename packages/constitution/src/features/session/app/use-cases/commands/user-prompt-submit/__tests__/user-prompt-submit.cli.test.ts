import { describe, expect, it } from 'bun:test';

import { createFakeContext, runCommand } from '#/__tests__/command-line.fake';

import { SessionId } from '../../../../../domain/value-objects';
import { createUserPromptSubmitCommand } from '../user-prompt-submit.cli';

const runOf = async (
  stdin: string,
): Promise<{
  marked: SessionId[];
  stdout: string;
}> => {
  const marked: SessionId[] = [];
  const { context, record } = createFakeContext({
    stdin,
  });

  await runCommand({
    args: [],
    command: createUserPromptSubmitCommand({
      ...context,
      markTurn: (session: SessionId): void => {
        marked.push(session);
      },
    }),
    group: 'hook',
  });

  return {
    marked,
    stdout: record().stdout,
  };
};

describe('createUserPromptSubmitCommand', () => {
  it('should mark the turn of the session the event names, and write nothing', async () => {
    // Arrange
    const stdin = '{"session_id":"s1","prompt":"go"}';

    // Act
    const run = await runOf(stdin);

    // Assert
    expect(run).toStrictEqual({
      marked: [
        SessionId.create('s1'),
      ],
      stdout: '',
    });
  });

  it.each([
    {
      condition: 'the session id is no plain name',
      stdin: '{"session_id":"x/y","prompt":"go"}',
    },
    {
      condition: 'the event names no session',
      stdin: '{"prompt":"go"}',
    },
  ])('should mark nothing, and write nothing, when $condition', async ({ stdin }) => {
    // Arrange
    const given = stdin;

    // Act
    const run = await runOf(given);

    // Assert
    expect(run).toStrictEqual({
      marked: [],
      stdout: '',
    });
  });
});
