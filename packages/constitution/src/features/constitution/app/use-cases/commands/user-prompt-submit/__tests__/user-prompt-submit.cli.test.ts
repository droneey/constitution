import { describe, expect, it } from 'bun:test';

import { SessionMark } from '../../../../../domain/entities';
import { commandLineOf, createFakeCommandRun } from '../../../../__tests__/command-line.fake';
import { createUserPromptSubmitCommand } from '../user-prompt-submit.cli';

interface Recorded {
  mark: SessionMark;
  session: string;
  value: string;
}

describe('createUserPromptSubmitCommand', () => {
  it.each([
    {
      condition: 'the session has a tree to fingerprint',
      fingerprint: 'f00d',
      marks: [
        {
          mark: SessionMark.Turn,
          session: 'session-1',
          value: 'f00d',
        },
      ],
    },
    {
      condition: 'the session keeps no state',
      fingerprint: undefined,
      marks: [],
    },
  ])(
    'should note the tree of the session as the turn begins when $condition',
    async ({ fingerprint, marks }) => {
      // Arrange
      const fake = createFakeCommandRun({
        stdin: '{"session_id":"session-1","hook_event_name":"UserPromptSubmit","prompt":"Go"}',
      });
      let asked: readonly string[] = [];
      let recorded: readonly Recorded[] = [];
      const cli = await commandLineOf(
        createUserPromptSubmitCommand({
          ...fake.run,
          fingerprintSession: (session: string): string | undefined => {
            asked = [
              ...asked,
              session,
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
        'user-prompt-submit',
      ]);

      // Assert
      expect({
        asked,
        record: fake.record(),
        recorded,
      }).toStrictEqual({
        asked: [
          'session-1',
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
    },
  );
});
