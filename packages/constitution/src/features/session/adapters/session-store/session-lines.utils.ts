import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

import { attempted, isSyntaxError } from '#/kernel/utils';

import type { AgentInSession } from '../../domain/entities';
import type { SessionId } from '../../domain/value-objects';
import { agentFileNameOf } from './agent-file.utils';
import { appendPrivately, readUnfollowed, writeOrDrop } from './private-file.utils';
import { PRIVATE_FOLDER_MODE } from './state-folder.utils';

type FolderOf = (session: SessionId) => string | undefined;

interface LinesFile extends AgentInSession {
  readonly name: string;
}

interface AppendInput extends LinesFile {
  readonly lines: readonly unknown[];
}

interface SessionLines {
  readonly append: (input: AppendInput) => void;
  readonly folderOf: FolderOf;
  readonly madeFolderOf: FolderOf;
  readonly readLines: (input: LinesFile) => readonly unknown[];
}

const filePathOf = (
  input: LinesFile & {
    folder: string;
  },
): string => join(input.folder, agentFileNameOf(input));

const parsedLineOf = (line: string): readonly unknown[] => {
  const read = attempted<{
    readonly parsed: unknown;
  }>({
    effect: () => ({
      parsed: JSON.parse(line),
    }),
    isRecognised: isSyntaxError,
  });

  if (read === undefined) {
    // Stryker disable next-line ArrayDeclaration: each reader drops a line of no form it knows, so a line that is no JSON is dropped either way
    return [];
  }

  return [
    read.parsed,
  ];
};

const linesOf = (text: string | undefined): readonly unknown[] =>
  // Stryker disable next-line ArrayDeclaration: each reader drops a line of no form it knows, so a missing file reads as no lines either way
  (text?.split('\n') ?? []).flatMap(parsedLineOf);

// Why: hooks run at once, so every file here is only appended to, one JSON value a line, and a
// line that marks or settles ends what came before it in place of a rewrite that could lose another
// hook's line.
const sessionLinesOf = (folderOf: FolderOf): SessionLines => {
  // Why: the gate runs on a session whose start it missed, so it makes the folder it writes to.
  const madeFolderOf = (session: SessionId): string | undefined => {
    const folder = folderOf(session);

    if (folder !== undefined) {
      writeOrDrop(() => {
        mkdirSync(folder, {
          mode: PRIVATE_FOLDER_MODE,
          // Stryker disable next-line BooleanLiteral: the sessions folder above is made first, so only a folder made already would fail, as a dropped write
          recursive: true,
        });
      });
    }

    return folder;
  };

  return {
    append: (input): void => {
      const folder = madeFolderOf(input.session);

      if (folder === undefined || input.lines.length === 0) {
        return;
      }

      writeOrDrop(() => {
        appendPrivately({
          path: filePathOf({
            ...input,
            folder,
          }),
          text: input.lines.map((line) => `${JSON.stringify(line)}\n`).join(''),
        });
      });
    },
    folderOf,
    madeFolderOf,
    readLines: (input): readonly unknown[] => {
      const folder = folderOf(input.session);

      return linesOf(
        folder === undefined
          ? undefined
          : readUnfollowed(
              filePathOf({
                ...input,
                folder,
              }),
            ),
      );
    },
  };
};

export type { FolderOf, LinesFile, SessionLines };
export { sessionLinesOf };
