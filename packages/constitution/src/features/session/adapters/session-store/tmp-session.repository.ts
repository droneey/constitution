import {
  appendFileSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';

import { LOWERED_LEVELS } from '#/kernel/constants';
import { ActiveBlock, Lowering, MustRule } from '#/kernel/entities';
import { attempted } from '#/kernel/utils';
import { BlockId, Glob, RuleSlug, UnitPath } from '#/kernel/value-objects';
import { isSystemError } from '#/libs/system-error';

import type { SessionCommandRepository } from '../../domain/contracts/repositories/commands';
import type { SessionQueryRepository } from '../../domain/contracts/repositories/queries';
import type { SessionMark } from '../../domain/entities';
import { CheckKind, CheckState, SessionState } from '../../domain/entities';
import type { AgentId, SessionId } from '../../domain/value-objects';

// A session's state is a folder of plain files: active.tsv, one record to a line, its fields split
// by tabs; reminded, and reminded.<agent> for each subagent, one block to a line; and one file per
// mark holding the fingerprint. An active block names its unit by the unit's place among the
// project's, the repository's 0, and a MUST rule writes the overrides that lower it after its slug:
// "<slug> (<level>[ in <unit>][ via <rule>]; ...)".

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

// A file the session never wrote, or lost, reads as undefined.
const readText = (path: string): string | undefined =>
  attempted({
    effect: () => readFileSync(path, 'utf8'),
    isRecognised: isSystemError,
  });

const wordsOf = (text: string | undefined): readonly string[] =>
  (text ?? '').split(SPACE).filter((word) => word !== '');

// An active block with the place of its unit among the project's, as its record names them.
interface PlacedBlock {
  readonly block: ActiveBlock;
  readonly place: number;
}

// A record of an active block, or none when it names no block or no unit as the program writes them.
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

// A state that names no project is none.
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

// A file another hook may read lands whole: written beside it, then renamed over it.
const writeWhole = (input: { path: string; text: string }): void => {
  const pending = `${input.path}.${String(process.pid)}.tmp`;

  writeFileSync(pending, input.text);
  renameSync(pending, input.path);
};

const remindedFile = (input: { agent: AgentId | undefined; folder: string }): string =>
  join(input.folder, input.agent === undefined ? REMINDED : `${REMINDED}.${input.agent}`);

/** folder holds a folder per session. */
const createTmpSessionRepository = (input: {
  folder: string;
}): SessionCommandRepository & SessionQueryRepository => {
  const folderOf = (session: SessionId): string => join(input.folder, session);

  return {
    addReminded: (added: {
      agent: AgentId | undefined;
      ids: readonly BlockId[];
      session: SessionId;
    }): void => {
      tryWrite(() => {
        appendFileSync(
          remindedFile({
            agent: added.agent,
            folder: folderOf(added.session),
          }),
          added.ids.map((id) => `${id}\n`).join(''),
        );
      });
    },
    recordMark: (recorded: { mark: SessionMark; session: SessionId; value: string }): void => {
      tryWrite(() => {
        writeWhole({
          path: join(folderOf(recorded.session), recorded.mark),
          text: `${recorded.value}\n`,
        });
      });
    },
    saveState: (saved: {
      isReminderKept: boolean;
      session: SessionId;
      state: SessionState;
    }): void => {
      const folder = folderOf(saved.session);
      const text = linesOfState(saved.state)
        .map((line) => `${line}\n`)
        .join('');

      tryWrite(() => {
        mkdirSync(folder, {
          recursive: true,
        });
        writeWhole({
          path: join(folder, ACTIVE),
          text,
        });

        if (!saved.isReminderKept) {
          writeFileSync(join(folder, REMINDED), '');

          for (const name of readdirSync(folder).filter((file) =>
            file.startsWith(`${REMINDED}.`),
          )) {
            rmSync(join(folder, name));
          }
        }
      });
    },
    mark: (asked: { mark: SessionMark; session: SessionId }): string | undefined =>
      readText(join(folderOf(asked.session), asked.mark))?.replace(/\n+$/, ''),
    reminded: (asked: { agent: AgentId | undefined; session: SessionId }): ReadonlySet<BlockId> =>
      new Set(
        readText(
          remindedFile({
            agent: asked.agent,
            folder: folderOf(asked.session),
          }),
        )
          ?.split('\n')
          .filter(BlockId.is),
      ),
    state: (session: SessionId): SessionState | undefined => {
      const text = readText(join(folderOf(session), ACTIVE));

      return text === undefined ? undefined : stateOf(text);
    },
  };
};

export { createTmpSessionRepository };
