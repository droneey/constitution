import { describe, expect, it } from 'bun:test';

import { z } from 'zod';

import { createFakeContext, runCommand } from '#/__tests__/command-context.fake';
import { Version } from '#/kernel/value-objects';

import { sessionStateOf } from '../../../../../__tests__/session.fixtures';
import type { SessionDigest, SessionStart, SessionState } from '../../../../../domain/entities';
import { DigestKind, HookEventName, SessionOrigin } from '../../../../../domain/entities';
import { SessionId } from '../../../../../domain/value-objects';
import { digestOf } from '../../../../utils';
import { createSessionStartCommand } from '../session-start.cli';

interface Kept {
  event: HookEventName;
  origin: SessionOrigin;
  session: SessionId;
  state: SessionState | undefined;
}

interface KeptAfter extends Kept {
  askedBefore: number;
}

const EVENT =
  '{"session_id":"session-1","cwd":"/work/event","hook_event_name":"SubagentStart","source":"startup"}';

const keptState = sessionStateOf();
const noRelease: SessionDigest = {
  contents: {
    kind: DigestKind.NoRelease,
    releaseFolder: '/work/project/.droneey/constitution',
  },
  state: keptState,
};
const noReleaseLines = digestOf(noRelease.contents).head;
const UNPARSED = {
  core: '# The "droneey" core\n',
  kind: DigestKind.Unparsed,
  line: 2,
  release: {
    folder: '/work/project/.droneey/constitution',
    version: Version.create('1.0.0'),
  },
} as const;
const unparsedDigest = digestOf(UNPARSED);

// What a hook wrote on standard output, read as Claude Code reads it: the event it answers and the
// lines of the context it adds; the digest's wording is digestOf's, which its own spec pins.
const contextOf = (
  stdout: string,
): {
  readonly event: unknown;
  readonly lines: readonly string[];
} => {
  const output = z
    .strictObject({
      hookSpecificOutput: z.strictObject({
        additionalContext: z.string(),
        hookEventName: z.string(),
      }),
    })
    .parse(JSON.parse(stdout)).hookSpecificOutput;

  return {
    event: output.hookEventName,
    lines: output.additionalContext.split('\n').slice(0, -1),
  };
};

const runOf = async (input: {
  digest: SessionDigest | undefined;
  places?: {
    cwd: string;
    projectDir?: string;
  };
  stdin: string;
}): Promise<{
  asked: SessionStart[];
  kept: KeptAfter[];
  stdout: string;
}> => {
  const asked: SessionStart[] = [];
  const kept: KeptAfter[] = [];
  const { context, record } = createFakeContext({
    ...(input.places === undefined
      ? {}
      : {
          places: input.places,
        }),
    stdin: input.stdin,
  });

  await runCommand({
    args: [],
    command: createSessionStartCommand({
      ...context,
      digestSession: (start: SessionStart): SessionDigest | undefined => {
        asked.push(start);

        return input.digest;
      },
      keepSession: (state: Kept): void => {
        kept.push({
          ...state,
          askedBefore: asked.length,
        });
      },
    }),
    group: 'hook',
  });

  return {
    asked,
    kept,
    stdout: record().stdout,
  };
};

describe('createSessionStartCommand', () => {
  it.each([
    {
      condition: 'Claude Code names the project',
      places: {
        cwd: '/work/package',
        projectDir: '/work/project',
      },
      searchFrom: '/work/project',
    },
    {
      condition: 'only the event names a folder',
      places: {
        cwd: '/work/package',
      },
      searchFrom: '/work/event',
    },
  ])(
    'should start the session from $searchFrom, and keep nothing, when $condition and no project is there',
    async ({ places, searchFrom }) => {
      // Arrange
      const asked = {
        digest: undefined,
        places,
        stdin: EVENT,
      };

      // Act
      const run = await runOf(asked);

      // Assert
      expect(run).toStrictEqual({
        asked: [
          {
            event: HookEventName.SubagentStart,
            origin: SessionOrigin.Startup,
            searchFrom,
          },
        ],
        kept: [],
        stdout: '',
      });
    },
  );

  it('should start the session from the folder the run starts in when neither names one', async () => {
    // Arrange
    const asked = {
      digest: undefined,
      places: {
        cwd: '/work/package',
      },
      stdin: '{"session_id":"session-1"}',
    };

    // Act
    const run = await runOf(asked);

    // Assert
    expect(run.asked[0]?.searchFrom).toBe('/work/package');
  });

  it.each([
    {
      condition: 'the digest has a body',
      contents: UNPARSED,
      lines: [
        ...unparsedDigest.head,
        '',
        ...unparsedDigest.body,
      ],
    },
    {
      condition: 'the digest is its head alone',
      contents: noRelease.contents,
      lines: noReleaseLines,
    },
  ])(
    'should keep the state the start gave, then give the digest as the context of its event, when $condition',
    async ({ contents, lines }) => {
      // Arrange
      const asked = {
        digest: {
          contents,
          state: keptState,
        },
        stdin: EVENT,
      };

      // Act
      const run = await runOf(asked);

      // Assert
      expect({
        context: contextOf(run.stdout),
        kept: run.kept,
      }).toStrictEqual({
        context: {
          event: 'SubagentStart',
          lines,
        },
        kept: [
          {
            askedBefore: 1,
            event: HookEventName.SubagentStart,
            origin: SessionOrigin.Startup,
            session: SessionId.create('session-1'),
            state: keptState,
          },
        ],
      });
    },
  );

  it.each([
    {
      condition: 'names no event',
      stdin: '{"session_id":"session-1","source":"resume"}',
    },
    {
      condition: 'names its event as an empty text',
      stdin: '{"session_id":"session-1","hook_event_name":"","source":"resume"}',
    },
  ])(
    'should start, keep and answer a session start when the event $condition',
    async ({ stdin }) => {
      // Arrange
      const asked = {
        digest: noRelease,
        stdin,
      };

      // Act
      const run = await runOf(asked);

      // Assert
      expect({
        asked: run.asked,
        context: contextOf(run.stdout),
        kept: run.kept,
      }).toStrictEqual({
        asked: [
          {
            event: HookEventName.SessionStart,
            origin: SessionOrigin.Resume,
            searchFrom: '/work/project/package',
          },
        ],
        kept: [
          {
            askedBefore: 1,
            event: HookEventName.SessionStart,
            origin: SessionOrigin.Resume,
            session: SessionId.create('session-1'),
            state: keptState,
          },
        ],
        context: {
          event: 'SessionStart',
          lines: noReleaseLines,
        },
      });
    },
  );

  it.each([
    {
      condition: 'the session id is no plain name',
      stdin: '{"session_id":"x/y","hook_event_name":"SessionStart","source":"startup"}',
    },
    {
      condition: 'the event names no session',
      stdin: '{"hook_event_name":"SessionStart","source":"startup"}',
    },
  ])('should keep nothing, yet give the digest, when $condition', async ({ stdin }) => {
    // Arrange
    const asked = {
      digest: noRelease,
      stdin,
    };

    // Act
    const run = await runOf(asked);

    // Assert
    expect({
      context: contextOf(run.stdout),
      kept: run.kept,
    }).toStrictEqual({
      context: {
        event: 'SessionStart',
        lines: noReleaseLines,
      },
      kept: [],
    });
  });
});
