import { describe, expect, it } from 'bun:test';

import { createFakeContext, runCommand } from '#/__tests__/command-context.fake';
import { AbsolutePath, Version } from '#/kernel/value-objects';

import { sessionStateOf } from '../../../../../__tests__/session.fixtures';
import type { SessionState } from '../../../../../domain/session/entities';
import { SessionId } from '../../../../../domain/session/value-objects';
import type { SessionDigest } from '../../../../../domain/session-digest/entities';
import { DigestKind } from '../../../../../domain/session-digest/entities';
import type { SessionStart } from '../../../../../domain/session-start/entities';
import { SessionOrigin } from '../../../../../domain/session-start/entities';
import { HookEventName } from '../../../../../domain/shared/entities';
import { digestTextOf } from '../../../../utils';
import { createUserPromptSubmitCommand } from '../user-prompt-submit.cli';

interface Kept {
  event: HookEventName;
  origin: SessionOrigin;
  session: SessionId;
  state: SessionState | undefined;
}

type Step =
  | {
      kept: Kept;
    }
  | {
      marked: SessionId;
    };

const EVENT = '{"session_id":"s1","cwd":"/work/event","prompt":"go"}';
const promptSession = SessionId.create('s1');
const unparsedDigest: SessionDigest = {
  contents: {
    core: '# The "droneey" core\n',
    kind: DigestKind.Unparsed,
    lines: [
      2,
    ],
    release: {
      folderPath: AbsolutePath.create('/work/project/.droneey/constitution'),
      version: Version.create('1.0.0'),
    },
  },
  state: sessionStateOf(),
};

const runOf = async (input: {
  digest?: SessionDigest;
  isStarted: boolean;
  stdin: string;
}): Promise<{
  asked: SessionStart[];
  steps: Step[];
  stdout: string;
}> => {
  const asked: SessionStart[] = [];
  const steps: Step[] = [];
  const { context, record } = createFakeContext({
    places: {
      cwd: '/work/package',
    },
    stdin: input.stdin,
  });

  await runCommand({
    args: [],
    command: createUserPromptSubmitCommand({
      ...context,
      digestSession: (start: SessionStart): SessionDigest | undefined => {
        asked.push(start);

        return input.digest;
      },
      isSessionStarted: (): boolean => input.isStarted,
      keepSession: (kept: Kept): void => {
        steps.push({
          kept,
        });
      },
      markTurn: (session: SessionId): void => {
        steps.push({
          marked: session,
        });
      },
    }),
    group: 'hook',
  });

  return {
    asked,
    steps,
    stdout: record().stdout,
  };
};

describe('createUserPromptSubmitCommand', () => {
  it('should mark the turn of the session the event names, and write nothing, when the session is started', async () => {
    // Arrange
    const asked = {
      isStarted: true,
      stdin: EVENT,
    };

    // Act
    const run = await runOf(asked);

    // Assert
    expect(run).toStrictEqual({
      asked: [],
      steps: [
        {
          marked: promptSession,
        },
      ],
      stdout: '',
    });
  });

  it('should start the session first, then mark the turn and give the digest, when the session is not started', async () => {
    // Arrange
    const asked = {
      digest: unparsedDigest,
      isStarted: false,
      stdin: EVENT,
    };

    // Act
    const run = await runOf(asked);

    // Assert
    expect(run).toStrictEqual({
      asked: [
        {
          event: HookEventName.UserPromptSubmit,
          origin: SessionOrigin.Unknown,
          searchFrom: AbsolutePath.create('/work/event'),
        },
      ],
      steps: [
        {
          kept: {
            event: HookEventName.UserPromptSubmit,
            origin: SessionOrigin.Unknown,
            session: promptSession,
            state: unparsedDigest.state,
          },
        },
        {
          marked: promptSession,
        },
      ],
      stdout: `${JSON.stringify({
        hookSpecificOutput: {
          additionalContext: digestTextOf(unparsedDigest.contents),
          hookEventName: 'UserPromptSubmit',
        },
      })}\n`,
    });
  });

  it('should mark the turn and keep nothing, when the session is not started and no project is there', async () => {
    // Arrange
    const asked = {
      isStarted: false,
      stdin: EVENT,
    };

    // Act
    const run = await runOf(asked);

    // Assert
    expect(run).toStrictEqual({
      asked: [
        {
          event: HookEventName.UserPromptSubmit,
          origin: SessionOrigin.Unknown,
          searchFrom: AbsolutePath.create('/work/event'),
        },
      ],
      steps: [
        {
          marked: promptSession,
        },
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
  ])(
    'should start nothing, mark nothing, and write nothing, when $condition',
    async ({ stdin }) => {
      // Arrange
      const asked = {
        isStarted: false,
        stdin,
      };

      // Act
      const run = await runOf(asked);

      // Assert
      expect(run).toStrictEqual({
        asked: [],
        steps: [],
        stdout: '',
      });
    },
  );
});
