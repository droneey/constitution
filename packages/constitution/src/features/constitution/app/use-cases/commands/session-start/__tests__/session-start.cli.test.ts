import { describe, expect, it } from 'bun:test';

import type { SessionDigest, SessionStart } from '../../../../../domain/entities';
import { commandLineOf, createFakeCommandRun } from '../../../../__tests__/command-line.fake';
import { createSessionStartCommand } from '../session-start.cli';

const EVENT =
  '{"session_id":"session-1","cwd":"/work/event","hook_event_name":"SubagentStart","source":"startup"}';

const DIGEST: SessionDigest = {
  digest: {
    body: [
      '## Domains',
      '- ui: Screens.',
    ],
    head: [
      '# The "droneey" constitution',
      'constitution.yaml makes 2 blocks active.',
    ],
  },
  event: 'SubagentStart',
};

const SAVE: NonNullable<SessionDigest['save']> = {
  isReminderKept: false,
  session: 'session-1',
  state: {
    active: [],
    musts: [],
    project: '/work',
  },
};

describe('createSessionStartCommand', () => {
  it.each([
    {
      condition: 'Claude Code names the project',
      places: {
        cwd: '/work/package',
        projectDir: '/work/project',
      },
      start: '/work/project',
      stdin: EVENT,
    },
    {
      condition: 'only the event names a folder',
      places: {
        cwd: '/work/package',
        projectDir: '',
      },
      start: '/work/event',
      stdin: EVENT,
    },
    {
      condition: 'neither names a folder',
      places: {
        cwd: '/work/package',
        projectDir: '',
      },
      start: '/work/package',
      stdin: '{"session_id":"session-1","hook_event_name":"SubagentStart","source":"startup"}',
    },
  ])(
    'should look for the project from the first folder named when $condition',
    async ({ places, start, stdin }) => {
      // Arrange
      const fake = createFakeCommandRun({
        places,
        stdin,
      });
      let asked: readonly SessionStart[] = [];
      const cli = await commandLineOf(
        createSessionStartCommand({
          ...fake.run,
          digestSession: (started: SessionStart): undefined => {
            asked = [
              ...asked,
              started,
            ];
          },
          saveSession: (): void => {
            // the session keeps no state when no digest is given
          },
        }),
      );

      // Act
      await cli.run([
        'session-start',
      ]);

      // Assert
      expect({
        asked,
        record: fake.record(),
      }).toStrictEqual({
        asked: [
          {
            event: 'SubagentStart',
            origin: 'startup',
            session: 'session-1',
            start,
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
      });
    },
  );

  it.each([
    {
      condition: 'the digest has rules and a state to keep',
      digest: {
        ...DIGEST,
        save: SAVE,
      },
      saved: [
        SAVE,
      ],
      written:
        '{"hookSpecificOutput":{"hookEventName":"SubagentStart","additionalContext":"# The \\"droneey\\" constitution\\nconstitution.yaml makes 2 blocks active.\\n\\n## Domains\\n- ui: Screens.\\n"}}\n',
    },
    {
      condition: 'the digest has no rules and no state',
      digest: {
        ...DIGEST,
        digest: {
          body: [],
          head: [
            'No release is installed.',
          ],
        },
      },
      saved: [],
      written:
        '{"hookSpecificOutput":{"hookEventName":"SubagentStart","additionalContext":"No release is installed.\\n"}}\n',
    },
  ])(
    'should keep the state and give the digest as the event context when $condition',
    async ({ digest, saved, written }) => {
      // Arrange
      const fake = createFakeCommandRun({
        stdin: EVENT,
      });
      let kept: readonly NonNullable<SessionDigest['save']>[] = [];
      const cli = await commandLineOf(
        createSessionStartCommand({
          ...fake.run,
          digestSession: (): SessionDigest => digest,
          saveSession: (save): void => {
            kept = [
              ...kept,
              save,
            ];
          },
        }),
      );

      // Act
      await cli.run([
        'session-start',
      ]);

      // Assert
      expect({
        kept,
        written: fake.record().written,
      }).toStrictEqual({
        kept: saved,
        written: [
          written,
        ],
      });
    },
  );
});
