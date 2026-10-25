import { mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

import { LOWERED_LEVELS } from '#/kernel/constants';
import { ActiveBlock, Lowering, MustRule } from '#/kernel/entities';
import { attempted } from '#/kernel/utils';
import { BlockId, Glob, RuleSlug, UnitPath } from '#/kernel/value-objects';
import { isSystemError } from '#/libs/system-error';

import type {
  SaveStateInput,
  SessionCommandRepository,
} from '../../domain/contracts/repositories/commands';
import type { SessionQueryRepository } from '../../domain/contracts/repositories/queries';
import { CheckKind, CheckState, SessionState } from '../../domain/entities';
import type { AgentId, SessionId } from '../../domain/value-objects';
import { appendPrivately, readUnfollowed, writeWhole } from './private-file.utils';
import type { StateEnvironment, StateFolderWarning } from './state-folder.utils';
import { privateStateFolder, removeOwnedFolder, sweepStale } from './state-folder.utils';

// A session's folder, named by its id, holds plain files: active.tsv, one record to a line, its
// fields split by tabs; reminded, and reminded.<agent> for each subagent, one block to a line; and
// one file per mark, holding its fingerprint. An active record names its unit by the unit's place
// among the project's, the repository's 0; a must record writes the overrides that lower its rule
// after the slug: "<slug> (<level>[ in <unit>][ via <rule>]; ...)".

const PROGRAM_FOLDER = 'droneey-constitution';
const SESSIONS_FOLDER = 'sessions';
const SESSION_FOLDER_MODE = 0o700;
// as Claude Code forgets a transcript after 30 days; an instant subtracts no days
const keptFor = Temporal.Duration.from({
  hours: 720,
});
const ACTIVE = 'active.tsv';
const REMINDED = 'reminded';
const TAB = '\t';
const SPACE = ' ';
const NOTE_SEPARATOR = '; ';
const MUST_TEXT = /^(\S+)(?: \((.*)\))?$/;
const LOWERING_TEXT = /^(\S+)(?: in (.+?))?(?: via (\S+))?$/;

enum Record {
  Project = 'project',
  Check = 'check',
  Active = 'active',
  Must = 'must',
}

const wordsOf = (text: string | undefined): readonly string[] =>
  (text ?? '').split(SPACE).filter((word) => word !== '');

interface PlacedBlock {
  readonly block: ActiveBlock;
  readonly place: number;
}

const placedOf = (fields: readonly string[]): readonly PlacedBlock[] => {
  const [, place, unit, id, governs, files] = fields;

  return BlockId.is(id) && UnitPath.is(unit)
    ? [
        {
          block: ActiveBlock.create({
            files: wordsOf(files),
            governs: wordsOf(governs).map(Glob.create),
            id,
            unit,
          }),
          place: Number(place),
        },
      ]
    : [];
};

// The units the active blocks name, in the order of their places.
const unitsOf = (placed: readonly PlacedBlock[]): readonly UnitPath[] =>
  [
    ...new Map(
      placed.map(({ block, place }) => [
        place,
        block.unit,
      ]),
    ),
  ]
    .toSorted(([left], [right]) => left - right)
    .map(([, unit]) => unit);

const loweringOf = (text: string): readonly Lowering[] => {
  const match = LOWERING_TEXT.exec(text);
  const lowered = LOWERED_LEVELS.find((candidate) => candidate === match?.[1]);
  // a lowering that names no unit is the repository's
  const unit = match?.[2] ?? '';
  const via = match?.[3];

  return lowered === undefined || !UnitPath.is(unit) || (via !== undefined && !RuleSlug.is(via))
    ? []
    : [
        Lowering.create({
          level: lowered,
          unit,
          // Stryker disable next-line ConditionalExpression: create leaves an absent via out
          ...(via === undefined
            ? {}
            : {
                via,
              }),
        }),
      ];
};

const mustOf = (fields: readonly string[]): readonly MustRule[] => {
  // Stryker disable next-line StringLiteral: a record without its text names no rule either way
  const [, block, text = ''] = fields;
  const match = MUST_TEXT.exec(text);
  const slug = match?.[1];
  const notes = match?.[2];

  return BlockId.is(block) && RuleSlug.is(slug)
    ? [
        MustRule.create({
          block,
          lowerings: notes === undefined ? [] : notes.split(NOTE_SEPARATOR).flatMap(loweringOf),
          slug,
        }),
      ]
    : [];
};

// No check record: constitution.yaml did not parse; an empty one: it names no check.
const checkOf = (fields: readonly string[] | undefined): CheckState => {
  if (fields === undefined) {
    return CheckState.unparsed();
  }

  const [, command = ''] = fields;

  return CheckState.create(command === '' ? undefined : command);
};

const stateOf = (text: string): SessionState | undefined => {
  const records = text.split('\n').map((line) => line.split(TAB));

  const first = (kind: Record): readonly string[] | undefined =>
    records.find((fields) => fields[0] === kind);

  const project = first(Record.Project)?.[1];
  const placed = records.filter((fields) => fields[0] === Record.Active).flatMap(placedOf);

  return project === undefined || project === ''
    ? undefined
    : SessionState.create({
        active: placed.map(({ block }) => block),
        check: checkOf(first(Record.Check)),
        musts: records.filter((fields) => fields[0] === Record.Must).flatMap(mustOf),
        project,
        units: unitsOf(placed),
      });
};

const checkLines = (check: CheckState): readonly string[] =>
  check.kind === CheckKind.Unparsed
    ? []
    : [
        [
          Record.Check,
          CheckState.commandOf(check) ?? '',
        ].join(TAB),
      ];

const loweringText = (lowering: Lowering): string =>
  `${lowering.level}${UnitPath.isRepository(lowering.unit) ? '' : ` in ${lowering.unit}`}${
    lowering.via === undefined ? '' : ` via ${lowering.via}`
  }`;

const mustText = (must: MustRule): string =>
  must.lowerings.length === 0
    ? must.slug
    : `${must.slug} (${must.lowerings.map(loweringText).join(NOTE_SEPARATOR)})`;

const linesOfState = (state: SessionState): readonly string[] => [
  [
    Record.Project,
    state.project,
  ].join(TAB),
  ...state.musts.map((must) =>
    [
      Record.Must,
      must.block,
      mustText(must),
    ].join(TAB),
  ),
  ...checkLines(state.check),
  ...state.active.map((block) =>
    [
      Record.Active,
      String(state.units.findIndex((unit) => UnitPath.equals(unit, block.unit))),
      block.unit,
      block.id,
      block.governs.join(SPACE),
      block.files.join(SPACE),
    ].join(TAB),
  ),
];

// A write that cannot land is dropped: it costs the reminders and the gate, never the hook.
const tryWrite = (write: () => void): void => {
  attempted({
    effect: write,
    isRecognised: isSystemError,
  });
};

const remindedFile = (input: { agent: AgentId | undefined; folder: string }): string =>
  join(input.folder, input.agent === undefined ? REMINDED : `${REMINDED}.${input.agent}`);

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
    path: join(folder, ACTIVE),
    text: linesOfState(saved.state)
      .map((line) => `${line}\n`)
      .join(''),
  });

  if (saved.isReminderKept) {
    return;
  }

  writeWhole({
    path: join(folder, REMINDED),
    text: '',
  });

  for (const name of readdirSync(folder).filter((file) => file.startsWith(`${REMINDED}.`))) {
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
          PROGRAM_FOLDER,
          SESSIONS_FOLDER,
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
    recordMark: (recorded): void => {
      const folder = folderOf(recorded.session);

      if (folder === undefined) {
        return;
      }

      tryWrite(() => {
        writeWhole({
          path: join(folder, recorded.mark),
          text: `${recorded.value}\n`,
        });
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
    mark: (asked): string | undefined => {
      const folder = folderOf(asked.session);

      return folder === undefined
        ? undefined
        : readUnfollowed(join(folder, asked.mark))?.replace(/\n+$/, '');
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
    state: (session: SessionId): SessionState | undefined => {
      const folder = folderOf(session);
      const text = folder === undefined ? undefined : readUnfollowed(join(folder, ACTIVE));

      return text === undefined ? undefined : stateOf(text);
    },
  };
};

export type { SessionsPlace };
export { createXdgSessionRepository };
