import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import { recognisedFailure } from '#/kernel/utils';
import { isSystemError } from '#/libs/system-error';

import { LOCK_FILE } from '../../domain/constants';
import type { AppliedFilesCommandRepository } from '../../domain/contracts/repositories/commands';
import type { AppliedFiles, FileText } from '../../domain/entities';
import { ApplyError, ApplyFailure } from '../../domain/errors';
import { textOfLock } from './lock-text.utils';

interface Before {
  readonly path: string;
  readonly text?: string;
}

// Stryker disable next-line StringLiteral: an encoding left empty is UTF-8 as well
const ENCODING = 'utf8';

// A file lands whole: written beside it under a fresh name no file holds yet, then renamed over it.
const writeWhole = (file: FileText): void => {
  const pending = `${file.path}.${randomUUID()}.tmp`;

  mkdirSync(dirname(file.path), {
    recursive: true,
  });
  // Stryker disable next-line ObjectLiteral: the default options write UTF-8 to a name no file holds yet
  writeFileSync(pending, file.text, {
    encoding: ENCODING,
    // Stryker disable next-line StringLiteral: a fresh pending name never trips the exclusive flag
    flag: 'wx',
  });
  renameSync(pending, file.path);
};

const beforeOf = (path: string): Before =>
  existsSync(path)
    ? {
        path,
        text: readFileSync(path, ENCODING),
      }
    : {
        path,
      };

const restore = (written: readonly Before[]): void => {
  for (const before of written.toReversed()) {
    if (before.text === undefined) {
      // Stryker disable next-line ObjectLiteral: the file was just written
      rmSync(before.path, {
        // Stryker disable next-line BooleanLiteral: the file was just written
        force: true,
      });
    } else {
      writeWhole({
        path: before.path,
        text: before.text,
      });
    }
  }
};

const write = (applied: AppliedFiles): void => {
  const files: readonly FileText[] = [
    ...applied.files,
    ...applied.locks.map((lock) => ({
      path: `${lock.folder}/${LOCK_FILE}`,
      text: textOfLock(lock.lock),
    })),
  ];
  const written: Before[] = [];
  // The deletions first, so a write that fails puts back a file deleted before it.
  const steps = [
    ...applied.deleted.map((path) => ({
      path,
      run: (): void => {
        rmSync(path);
      },
    })),
    ...files.map((file) => ({
      path: file.path,
      run: (): void => {
        writeWhole(file);
      },
    })),
  ];

  for (const step of steps) {
    try {
      const before = beforeOf(step.path);

      step.run();
      written.push(before);
    } catch (error) {
      recognisedFailure({
        error,
        isRecognised: isSystemError,
      });
      restore(written);

      throw new ApplyError(
        {
          code: ApplyFailure.NotWritten,
          details: {
            path: step.path,
          },
        },
        {
          cause: error,
        },
      );
    }
  }
};

const createFileAppliedFilesRepository = (): AppliedFilesCommandRepository => ({
  write,
});

export { createFileAppliedFilesRepository };
