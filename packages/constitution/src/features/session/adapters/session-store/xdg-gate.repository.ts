import { mkdirSync, readdirSync, realpathSync, rmSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

import { sessionsFolderInProject } from '#/kernel/constants';
import { attempted, isSyntaxError } from '#/kernel/utils';
import { AbsolutePath } from '#/kernel/value-objects';
import { isSystemError } from '#/libs/system-error';

import type {
  GateCommandRepository,
  RulesPart,
} from '../../domain/contracts/repositories/commands';
import type { GatedRule, ShellTree } from '../../domain/entities';
import { GateEntryKind, SessionAgent } from '../../domain/entities';
import type { SessionId } from '../../domain/value-objects';
import {
  debtsOfLines,
  entriesOfLines,
  LineMark,
  markLineOf,
  pathsAfterMarkOf,
  pathsOfLines,
  ruleReadLineOf,
  rulesReadOfLines,
  settledLineOf,
  shellTreeModel,
  shellTreeText,
} from './models';
import { readUnfollowed, writeOrDrop, writeWhole } from './private-file.utils';
import { partRulesOf, partTextsOf } from './rules-part.utils';
import type { LinesFile, SessionLines } from './session-lines.utils';
import { PRIVATE_FOLDER_MODE, sweepStale } from './state-folder.utils';

const RULES_READ_FILE_NAME = 'rules';
const DEBT_FILE_NAME = 'debt';
const GATE_FILE_NAME = 'gate';
const HOT_REMINDED_FILE_NAME = 'hot';
const PROJECTS_FILE_NAME = 'projects';
const PARTS_FOLDER_NAME = 'parts';
const PART_FILE_NAME = /^([0-9a-f]+)\.(\d+)\.md$/u;
// Why: a session that ends by a crash leaves no SessionEnd; a day outlasts a pause of one still at
// work, which writes its parts again when it needs them.
const partsKeptFor = Temporal.Duration.from({
  hours: 24,
});

interface PartFile {
  readonly path: AbsolutePath;
  readonly text: string;
}

interface XdgGateRepositoryInput {
  readonly lines: SessionLines;
  readonly maxEntries: number;
  readonly now: () => Temporal.Instant;
}

const realPathOf = (path: string): string | undefined =>
  attempted({
    effect: () => realpathSync(path),
    isRecognised: isSystemError,
  });

const shellFilePathOf = (input: { call: string; folder: string }): string =>
  join(input.folder, `shell.${input.call}.json`);

const sessionsFolderIn = (projectFolderPath: string): string =>
  join(projectFolderPath, sessionsFolderInProject);

const projectsFileOf = (session: SessionId): LinesFile => ({
  agent: SessionAgent.main,
  name: PROJECTS_FILE_NAME,
  session,
});

const partsFolderOf = (input: { projectFolderPath: string; session: SessionId }): string =>
  join(sessionsFolderIn(input.projectFolderPath), input.session, PARTS_FOLDER_NAME);

const partFilesOf = (input: {
  partsFolder: string;
  rules: readonly GatedRule[];
  set: string;
}): readonly PartFile[] =>
  partTextsOf(input.rules).map((text, index) => ({
    path: AbsolutePath.create(join(input.partsFolder, `${input.set}.${index + 1}.md`)),
    text,
  }));

// Why: a set's parts are named by the hash of its rules and never change, so parts already written
// are kept.
const arePartsKept = (input: { parts: readonly PartFile[]; partsFolder: string }): boolean => {
  const kept = new Set(
    attempted({
      effect: () => readdirSync(input.partsFolder),
      isRecognised: isSystemError,
    }),
  );

  return input.parts.every((part) => kept.has(basename(part.path)));
};

const arePartsWritten = (input: { parts: readonly PartFile[]; partsFolder: string }): boolean =>
  attempted({
    effect: (): boolean => {
      mkdirSync(input.partsFolder, {
        mode: PRIVATE_FOLDER_MODE,
        recursive: true,
      });

      for (const part of input.parts) {
        writeWhole(part);
      }

      return true;
    },
    isRecognised: isSystemError,
  }) === true;

const isPartOfSession = (input: { realPath: string; session: SessionId }): boolean =>
  dirname(input.realPath).endsWith(
    `/${join(sessionsFolderInProject, input.session, PARTS_FOLDER_NAME)}`,
  ) && PART_FILE_NAME.test(basename(input.realPath));

const partOfIn = (input: { path: string; session: SessionId }): RulesPart | undefined => {
  const realPath = realPathOf(input.path);

  if (
    realPath === undefined ||
    !isPartOfSession({
      realPath,
      session: input.session,
    })
  ) {
    return undefined;
  }

  const text = readUnfollowed(realPath);

  return text === undefined ? undefined : partRulesOf(text);
};

const shellTreeIn = (path: string): ShellTree | undefined => {
  const text = readUnfollowed(path);
  const parsed = shellTreeModel.safeParse(
    // Stryker disable next-line ConditionalExpression: no text parses to no tree either way
    text === undefined
      ? undefined
      : attempted<unknown>({
          effect: () => JSON.parse(text),
          isRecognised: isSyntaxError,
        }),
  );

  return parsed.success ? parsed.data : undefined;
};

const gateWritesOf = (
  input: XdgGateRepositoryInput,
): Pick<
  GateCommandRepository,
  | 'addDebts'
  | 'addGateEntry'
  | 'addHotReminded'
  | 'addRulesRead'
  | 'keepShellTree'
  | 'resetReading'
  | 'settleDebts'
  | 'sweepStaleSessions'
> => {
  const { lines } = input;

  return {
    addDebts: (added): void => {
      lines.append({
        ...added,
        lines: added.debts,
        name: DEBT_FILE_NAME,
      });
    },
    addGateEntry: (added): void => {
      lines.append({
        ...added,
        lines: [
          added.entry,
        ],
        name: GATE_FILE_NAME,
      });
    },
    addHotReminded: (added): void => {
      lines.append({
        ...added,
        lines: added.paths,
        name: HOT_REMINDED_FILE_NAME,
      });
    },
    addRulesRead: (added): void => {
      lines.append({
        ...added,
        lines: added.rules.map(ruleReadLineOf),
        name: RULES_READ_FILE_NAME,
      });
    },
    keepShellTree: (kept): void => {
      const folder = lines.madeFolderOf(kept.session);

      if (folder === undefined) {
        return;
      }

      writeOrDrop(() => {
        writeWhole({
          path: shellFilePathOf({
            call: kept.call,
            folder,
          }),
          text: shellTreeText(kept.tree),
        });
      });
    },
    resetReading: (reset): void => {
      for (const name of [
        RULES_READ_FILE_NAME,
        HOT_REMINDED_FILE_NAME,
      ]) {
        lines.append({
          ...reset,
          lines: [
            markLineOf(LineMark.Reset),
          ],
          name,
        });
      }

      lines.append({
        ...reset,
        lines: [
          {
            kind: GateEntryKind.Reset,
          },
        ],
        name: GATE_FILE_NAME,
      });
    },
    settleDebts: (settled): void => {
      lines.append({
        ...settled,
        lines: settled.debts.map(settledLineOf),
        name: DEBT_FILE_NAME,
      });
    },
    sweepStaleSessions: (swept): void => {
      sweepStale({
        folder: sessionsFolderIn(swept.projectFolderPath),
        inner: PARTS_FOLDER_NAME,
        kept: partsKeptFor,
        maxEntries: input.maxEntries,
        now: input.now(),
        spared: swept.session,
      });
    },
  };
};

const gatePartsOf = (
  lines: SessionLines,
): Pick<
  GateCommandRepository,
  'partOf' | 'removeSessionFolders' | 'takeShellTree' | 'writeParts'
> => ({
  partOf: (asked): RulesPart | undefined => partOfIn(asked),
  removeSessionFolders: (session): void => {
    for (const project of pathsOfLines(lines.readLines(projectsFileOf(session)))) {
      writeOrDrop(() => {
        rmSync(join(sessionsFolderIn(project), session), {
          recursive: true,
        });
      });
    }
  },
  takeShellTree: (asked): ShellTree | undefined => {
    const folder = lines.folderOf(asked.session);

    if (folder === undefined) {
      return undefined;
    }

    const path = shellFilePathOf({
      call: asked.call,
      folder,
    });
    const tree = shellTreeIn(path);

    writeOrDrop(() => {
      rmSync(path);
    });

    return tree;
  },
  writeParts: (written): readonly AbsolutePath[] => {
    const partsFolder = partsFolderOf(written);
    const parts = partFilesOf({
      partsFolder,
      rules: written.rules,
      set: written.set,
    });
    const paths = parts.map((part) => part.path);
    const kept = {
      parts,
      partsFolder,
    };

    if (arePartsKept(kept)) {
      return paths;
    }

    if (!arePartsWritten(kept)) {
      return [];
    }

    lines.append({
      ...projectsFileOf(written.session),
      lines: [
        written.projectFolderPath,
      ],
    });

    return paths;
  },
});

const gateReadsOf = (
  lines: SessionLines,
): Pick<GateCommandRepository, 'debts' | 'gateEntries' | 'hotReminded' | 'rulesRead'> => ({
  debts: (asked) =>
    debtsOfLines(
      lines.readLines({
        ...asked,
        name: DEBT_FILE_NAME,
      }),
    ),
  gateEntries: (asked) =>
    entriesOfLines(
      lines.readLines({
        ...asked,
        name: GATE_FILE_NAME,
      }),
    ),
  hotReminded: (asked): ReadonlySet<AbsolutePath> =>
    new Set(
      pathsAfterMarkOf(
        lines.readLines({
          ...asked,
          name: HOT_REMINDED_FILE_NAME,
        }),
        LineMark.Reset,
      ),
    ),
  rulesRead: (asked) =>
    rulesReadOfLines(
      lines.readLines({
        ...asked,
        name: RULES_READ_FILE_NAME,
      }),
    ),
});

const createXdgGateRepository = (input: XdgGateRepositoryInput): GateCommandRepository => ({
  ...gateReadsOf(input.lines),
  ...gatePartsOf(input.lines),
  ...gateWritesOf(input),
});

export { createXdgGateRepository };
