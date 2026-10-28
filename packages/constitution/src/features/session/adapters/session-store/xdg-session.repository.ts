import { mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

import { attempted, isSyntaxError } from '#/kernel/utils';
import { BlockId } from '#/kernel/value-objects';
import { isSystemError } from '#/libs/system-error';

import type {
  SaveStateInput,
  SessionCommandRepository,
} from '../../domain/contracts/repositories/commands';
import type { SessionQueryRepository } from '../../domain/contracts/repositories/queries';
import type { SessionState } from '../../domain/entities';
import { SessionMark } from '../../domain/entities';
import type { AgentId, SessionId } from '../../domain/value-objects';
import { TreeFingerprint } from '../../domain/value-objects';
import { sessionStateModel } from './models';
import { appendPrivately, readUnfollowed, writeWhole } from './private-file.utils';
import type { StateEnvironment, StateFolderWarning } from './state-folder.utils';
import { privateStateFolder, removeOwnedFolder, sweepStale } from './state-folder.utils';

// A session's folder, named by its id, holds plain files: state.json, the state as JSON; reminded,
// and reminded.<agent> for each subagent, one block to a line; and one file per mark, holding its
// fingerprint.

const PROGRAM_FOLDER_NAME = 'droneey-constitution';
const SESSIONS_FOLDER_NAME = 'sessions';
const SESSION_FOLDER_MODE = 0o700;
// as Claude Code forgets a transcript after 30 days; an instant subtracts no days
const keptFor = Temporal.Duration.from({
  hours: 720,
});
const STATE_FILE_NAME = 'state.json';
const REMINDED_FILE_NAME = 'reminded';

// A file that is no JSON, or no state of this release's form, keeps no state.
const stateOf = (text: string): SessionState | undefined => {
  const read = sessionStateModel.safeParse(
    attempted<unknown>({
      effect: () => JSON.parse(text),
      isRecognised: isSyntaxError,
    }),
  );

  return read.success ? read.data : undefined;
};

const stateText = (state: SessionState): string => `${JSON.stringify(state)}\n`;

// A write that cannot land is dropped: it costs the reminders and the gate, never the hook.
const tryWrite = (write: () => void): void => {
  attempted({
    effect: write,
    isRecognised: isSystemError,
  });
};

interface MarkFile {
  /** the session's folder, undefined where no folder keeps the sessions */
  readonly folder: string | undefined;
  readonly mark: SessionMark;
}

const writeMark = (
  input: MarkFile & {
    value: string;
  },
): void => {
  const { folder } = input;

  if (folder === undefined) {
    return;
  }

  tryWrite(() => {
    writeWhole({
      path: join(folder, input.mark),
      text: `${input.value}\n`,
    });
  });
};

const readMark = (input: MarkFile): string | undefined =>
  input.folder === undefined
    ? undefined
    : readUnfollowed(join(input.folder, input.mark))?.replace(/\n+$/, '');

const remindedFile = (input: { agent: AgentId | undefined; folder: string }): string =>
  join(
    input.folder,
    input.agent === undefined ? REMINDED_FILE_NAME : `${REMINDED_FILE_NAME}.${input.agent}`,
  );

interface SaveInput {
  readonly folder: string;
  readonly saved: SaveStateInput;
}

const writeState = ({ folder, saved }: SaveInput): void => {
  mkdirSync(folder, {
    mode: SESSION_FOLDER_MODE,
    recursive: true,
  });
  writeWhole({
    path: join(folder, STATE_FILE_NAME),
    text: stateText(saved.state),
  });

  if (saved.isReminderKept) {
    return;
  }

  writeWhole({
    path: join(folder, REMINDED_FILE_NAME),
    text: '',
  });

  for (const name of readdirSync(folder).filter((file) =>
    file.startsWith(`${REMINDED_FILE_NAME}.`),
  )) {
    rmSync(join(folder, name));
  }
};

interface SessionsPlace {
  readonly environment: StateEnvironment;
  /** the folder an earlier release kept the sessions in, removed when a session starts */
  readonly formerFolder: string;
  /** the user who must own the folders; undefined where the system has no users */
  readonly owner: number | undefined;
}

interface XdgSessionRepositoryInput extends SessionsPlace {
  /** the sessions a start looks at, at most, for those to remove */
  readonly maxSessions: number;
  readonly now: () => Temporal.Instant;
  /** told once, when no folder keeps the sessions and every hook keeps nothing */
  readonly warn: (warning: StateFolderWarning) => void;
}

/** A start removes the sessions unchanged for 30 days, and the folder of an earlier release. */
const createXdgSessionRepository = (
  input: XdgSessionRepositoryInput,
): SessionCommandRepository & SessionQueryRepository => {
  let prepared:
    | {
        readonly folder: string | undefined;
      }
    | undefined;

  // The folder is made and checked when a hook first needs it, so a command that keeps no session
  // never touches it.
  const sessionsFolder = (): string | undefined => {
    prepared ??= {
      folder: privateStateFolder({
        environment: input.environment,
        names: [
          PROGRAM_FOLDER_NAME,
          SESSIONS_FOLDER_NAME,
        ],
        owner: input.owner,
        warn: input.warn,
      }),
    };

    return prepared.folder;
  };

  const folderOf = (session: SessionId): string | undefined => {
    const folder = sessionsFolder();

    return folder === undefined ? undefined : join(folder, session);
  };

  return {
    addReminded: (added): void => {
      const folder = folderOf(added.session);

      if (folder === undefined) {
        return;
      }

      tryWrite(() => {
        appendPrivately({
          path: remindedFile({
            agent: added.agent,
            folder,
          }),
          text: added.ids.map((id) => `${id}\n`).join(''),
        });
      });
    },
    recordFingerprint: (recorded): void => {
      writeMark({
        folder: folderOf(recorded.session),
        mark: recorded.mark,
        value: recorded.fingerprint,
      });
    },
    recordUnjudged: (recorded): void => {
      writeMark({
        folder: folderOf(recorded.session),
        mark: SessionMark.Unjudged,
        value: recorded.reason,
      });
    },
    saveState: (saved): void => {
      removeOwnedFolder({
        folder: input.formerFolder,
        owner: input.owner,
      });

      const sessions = sessionsFolder();

      if (sessions === undefined) {
        return;
      }

      sweepStale({
        folder: sessions,
        kept: keptFor,
        maxEntries: input.maxSessions,
        now: input.now(),
      });

      tryWrite(() => {
        writeState({
          folder: join(sessions, saved.session),
          saved,
        });
      });
    },
    fingerprint: (asked): TreeFingerprint | undefined => {
      const text = readMark({
        folder: folderOf(asked.session),
        mark: asked.mark,
      });

      return TreeFingerprint.is(text) ? text : undefined;
    },
    reminded: (asked): ReadonlySet<BlockId> => {
      const folder = folderOf(asked.session);

      return new Set(
        folder === undefined
          ? []
          : readUnfollowed(
              remindedFile({
                agent: asked.agent,
                folder,
              }),
            )
              ?.split('\n')
              .filter(BlockId.is),
      );
    },
    unjudged: (session: SessionId): string | undefined =>
      readMark({
        folder: folderOf(session),
        mark: SessionMark.Unjudged,
      }),
    state: (session: SessionId): SessionState | undefined => {
      const folder = folderOf(session);
      const text = folder === undefined ? undefined : readUnfollowed(join(folder, STATE_FILE_NAME));

      // Stryker disable next-line ConditionalExpression: no text parses to no state either way
      return text === undefined ? undefined : stateOf(text);
    },
  };
};

export type { SessionsPlace };
export { createXdgSessionRepository };
