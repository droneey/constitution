import { mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

import { attempted, isSyntaxError } from '#/kernel/utils';
import type { AbsolutePath } from '#/kernel/value-objects';
import { BlockId } from '#/kernel/value-objects';

import type {
  GateCommandRepository,
  SaveStateInput,
  SessionCommandRepository,
} from '../../domain/contracts/repositories/commands';
import type { SessionQueryRepository } from '../../domain/contracts/repositories/queries';
import type { ReviewDebt, SessionState } from '../../domain/entities';
import { SessionAgent, SessionMark } from '../../domain/entities';
import type { SessionId } from '../../domain/value-objects';
import { TreeFingerprint } from '../../domain/value-objects';
import { agentFileNameOf } from './agent-file.utils';
import {
  LineMark,
  markLineOf,
  pathsAfterMarkOf,
  reviewDebtsOfLines,
  sessionStateModel,
  settledLineOf,
} from './models';
import { appendPrivately, readUnfollowed, writeOrDrop, writeWhole } from './private-file.utils';
import type { FolderOf, SessionLines } from './session-lines.utils';
import { sessionLinesOf } from './session-lines.utils';
import { wireOfState } from './session-state-wire.utils';
import type { StateEnvironment, StateFolderWarning } from './state-folder.utils';
import {
  PRIVATE_FOLDER_MODE,
  privateStateFolder,
  removeOwnedFolder,
  sweepStale,
} from './state-folder.utils';
import { createXdgGateRepository } from './xdg-gate.repository';

const PROGRAM_FOLDER_NAME = 'droneey-constitution';
const SESSIONS_FOLDER_NAME = 'sessions';
const OWN_CHANGES_FILE_NAME = 'owned';
const REVIEW_DEBT_FILE_NAME = 'review-debt';
// Why: Claude Code forgets a transcript after 30 days; an instant subtracts no days.
const keptFor = Temporal.Duration.from({
  hours: 720,
});
const STATE_FILE_NAME = 'state.json';
const REMINDED_FILE_NAME = 'reminded';

const stateOf = (text: string): SessionState | undefined => {
  const read = sessionStateModel.safeParse(
    attempted<unknown>({
      effect: () => JSON.parse(text),
      isRecognised: isSyntaxError,
    }),
  );

  return read.success ? read.data : undefined;
};

const stateText = (state: SessionState): string => `${JSON.stringify(wireOfState(state))}\n`;

interface MarkFile {
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

  writeOrDrop(() => {
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

const remindedFile = (input: { agent: SessionAgent; folder: string }): string =>
  join(
    input.folder,
    agentFileNameOf({
      agent: input.agent,
      name: REMINDED_FILE_NAME,
    }),
  );

interface SaveInput {
  readonly folder: string;
  readonly saved: SaveStateInput;
}

const writeState = ({ folder, saved }: SaveInput): void => {
  mkdirSync(folder, {
    mode: PRIVATE_FOLDER_MODE,
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

const handBackOf = (
  lines: SessionLines,
): Pick<
  SessionCommandRepository & SessionQueryRepository,
  | 'addOwnChanges'
  | 'addReviewDebt'
  | 'clearOwnChanges'
  | 'ownChanges'
  | 'reviewDebt'
  | 'settleReviewDebt'
> => ({
  addOwnChanges: (added): void => {
    lines.append({
      ...added,
      lines: added.paths,
      name: OWN_CHANGES_FILE_NAME,
    });
  },
  addReviewDebt: (added): void => {
    lines.append({
      agent: SessionAgent.main,
      lines: added.paths.map(
        (path): ReviewDebt => ({
          agent: added.subagent,
          path,
        }),
      ),
      name: REVIEW_DEBT_FILE_NAME,
      session: added.session,
    });
  },
  clearOwnChanges: (cleared): void => {
    lines.append({
      ...cleared,
      lines: [
        markLineOf(LineMark.Cleared),
      ],
      name: OWN_CHANGES_FILE_NAME,
    });
  },
  ownChanges: (asked): readonly AbsolutePath[] =>
    pathsAfterMarkOf(
      lines.readLines({
        ...asked,
        name: OWN_CHANGES_FILE_NAME,
      }),
      LineMark.Cleared,
    ),
  reviewDebt: (session): readonly ReviewDebt[] =>
    reviewDebtsOfLines(
      lines.readLines({
        agent: SessionAgent.main,
        name: REVIEW_DEBT_FILE_NAME,
        session,
      }),
    ),
  settleReviewDebt: (settled): void => {
    lines.append({
      agent: SessionAgent.main,
      lines: settled.debts.map(settledLineOf),
      name: REVIEW_DEBT_FILE_NAME,
      session: settled.session,
    });
  },
});

const marksOf = (
  folderOf: FolderOf,
): Pick<
  SessionCommandRepository & SessionQueryRepository,
  'addReminded' | 'fingerprint' | 'recordFingerprint' | 'recordUnjudged' | 'reminded' | 'unjudged'
> => ({
  addReminded: (added): void => {
    const folder = folderOf(added.session);

    if (folder === undefined) {
      return;
    }

    writeOrDrop(() => {
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
});

interface SessionsPlace {
  readonly environment: StateEnvironment;
  readonly formerFolder: string;
  readonly owner: number | undefined;
}

interface XdgSessionRepositoryInput extends SessionsPlace {
  readonly maxSessions: number;
  readonly now: () => Temporal.Instant;
  readonly warn: (warning: StateFolderWarning) => void;
}

const createXdgSessionRepository = (
  input: XdgSessionRepositoryInput,
): GateCommandRepository & SessionCommandRepository & SessionQueryRepository => {
  let prepared:
    | {
        readonly folder: string | undefined;
      }
    | undefined;

  // Why: the folder is made and checked when a hook first needs it, so a command that keeps no
  // session never touches it.
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

  const lines = sessionLinesOf(folderOf);

  return {
    ...createXdgGateRepository({
      lines,
      maxEntries: input.maxSessions,
      now: input.now,
    }),
    ...handBackOf(lines),
    ...marksOf(folderOf),
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

      writeOrDrop(() => {
        writeState({
          folder: join(sessions, saved.session),
          saved,
        });
      });
    },
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
