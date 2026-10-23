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

import { attempted, isSystemError } from '#/kernel/utils';

import type { SessionCommandRepository } from '../../domain/contracts/repositories/commands';
import type { SessionQueryRepository } from '../../domain/contracts/repositories/queries';
import type { ActiveBlock, MustRule, SessionMark, SessionState } from '../../domain/entities';

// A session's state is a folder of plain files: active.tsv, one record to a line, its fields split
// by tabs; reminded, and reminded.<agent> for each subagent, one block to a line; and one file per
// mark holding the fingerprint.

const ACTIVE = 'active.tsv';
const REMINDED = 'reminded';
const TAB = '\t';
const SPACE = ' ';

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

const activeOf = (fields: readonly string[]): ActiveBlock => {
  const [, scope = '', app = '', id = '', globs, files] = fields;

  return {
    app,
    files: wordsOf(files),
    globs: wordsOf(globs),
    id,
    scope: Number(scope),
  };
};

const stateOf = (text: string): SessionState => {
  const records = text.split('\n').map((line) => line.split(TAB));
  const first = (kind: Record): readonly string[] | undefined =>
    records.find((fields) => fields[0] === kind);
  const check = first(Record.Check);

  return {
    active: records.filter((fields) => fields[0] === Record.Active).map(activeOf),
    ...(check === undefined
      ? {}
      : {
          check: check[1] ?? '',
        }),
    musts: records
      .filter((fields) => fields[0] === Record.Must)
      .map(
        (fields): MustRule => ({
          block: fields[1] ?? '',
          rule: fields[2] ?? '',
        }),
      ),
    project: first(Record.Project)?.[1] ?? '',
  };
};

const linesOfState = (state: SessionState): readonly string[] => [
  [
    Record.Project,
    state.project,
  ].join(TAB),
  ...state.musts.map((must) =>
    [
      Record.Must,
      must.block,
      must.rule,
    ].join(TAB),
  ),
  ...(state.check === undefined
    ? []
    : [
        [
          Record.Check,
          state.check,
        ].join(TAB),
      ]),
  ...state.active.map((block) =>
    [
      Record.Active,
      String(block.scope),
      block.app,
      block.id,
      block.globs.join(SPACE),
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

const remindedFile = (input: { agent: string | undefined; folder: string }): string =>
  join(input.folder, input.agent === undefined ? REMINDED : `${REMINDED}.${input.agent}`);

// folder holds a folder per session.
const createTmpSessionRepositories = (input: {
  folder: string;
}): {
  commands: SessionCommandRepository;
  queries: SessionQueryRepository;
} => {
  const folderOf = (session: string): string => join(input.folder, session);

  return {
    commands: {
      addReminded: (added: {
        agent: string | undefined;
        ids: readonly string[];
        session: string;
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
      recordMark: (recorded: { mark: SessionMark; session: string; value: string }): void => {
        tryWrite(() => {
          writeWhole({
            path: join(folderOf(recorded.session), recorded.mark),
            text: `${recorded.value}\n`,
          });
        });
      },
      saveState: (saved: {
        isReminderKept: boolean;
        session: string;
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
    },
    queries: {
      mark: (asked: { mark: SessionMark; session: string }): string | undefined =>
        readText(join(folderOf(asked.session), asked.mark))?.replace(/\n+$/, ''),
      reminded: (asked: { agent: string | undefined; session: string }): ReadonlySet<string> =>
        new Set(
          (
            readText(
              remindedFile({
                agent: asked.agent,
                folder: folderOf(asked.session),
              }),
            ) ?? ''
          )
            .split('\n')
            .filter((line) => line !== ''),
        ),
      state: (session: string): SessionState | undefined => {
        const text = readText(join(folderOf(session), ACTIVE));

        return text === undefined ? undefined : stateOf(text);
      },
    },
  };
};

export { createTmpSessionRepositories };
