import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import { recognisedFailure } from '#/kernel/utils';
import { AbsolutePath } from '#/kernel/value-objects';
import { isSystemError } from '#/libs/system-error';

import type { AppliedFilesCommandRepository } from '../../application/contracts/repositories/commands';
import type { AppliedFiles, FileText } from '../../domain/apply-plan/entities';
import { ApplyError, ApplyFailure } from '../../domain/apply-plan/errors';
import { LOCK_FILE_NAME } from '../../domain/shared/constants';
import { textOfLock } from './lock-text.utils';

interface Before {
  readonly filePath: AbsolutePath;
  readonly text?: string;
}

// Stryker disable next-line StringLiteral: an encoding left empty is UTF-8 as well
const ENCODING = 'utf8';

// Why: a file lands whole: written beside it under a fresh name no file holds yet, then renamed
// over it.
const writeWhole = (file: FileText): void => {
  const pending = `${file.filePath}.${randomUUID()}.tmp`;

  mkdirSync(dirname(file.filePath), {
    recursive: true,
  });
  // Stryker disable next-line ObjectLiteral: the default options write UTF-8 to a name no file holds yet
  writeFileSync(pending, file.text, {
    encoding: ENCODING,
    // Stryker disable next-line StringLiteral: a fresh pending name never trips the exclusive flag
    flag: 'wx',
  });
  renameSync(pending, file.filePath);
};

const beforeOf = (filePath: AbsolutePath): Before =>
  existsSync(filePath)
    ? {
        filePath,
        text: readFileSync(filePath, ENCODING),
      }
    : {
        filePath,
      };

const restore = (written: readonly Before[]): void => {
  for (const before of written.toReversed()) {
    if (before.text === undefined) {
      // Stryker disable next-line ObjectLiteral: the file was just written
      rmSync(before.filePath, {
        // Stryker disable next-line BooleanLiteral: the file was just written
        force: true,
      });
    } else {
      writeWhole({
        filePath: before.filePath,
        text: before.text,
      });
    }
  }
};

/** @throws {ApplyError} when a file cannot be written, which leaves every file as it was */
const write = (applied: AppliedFiles): void => {
  const files: readonly FileText[] = [
    ...applied.files,
    ...applied.locks.map((lock) => ({
      filePath: AbsolutePath.join(lock.unitFolderPath, LOCK_FILE_NAME),
      text: textOfLock(lock.lock),
    })),
  ];
  const written: Before[] = [];
  // Why: the deletions first, so a write that fails puts back a file deleted before it.
  const steps = [
    ...applied.deletedFilePaths.map((filePath) => ({
      filePath,
      run: (): void => {
        rmSync(filePath);
      },
    })),
    ...files.map((file) => ({
      filePath: file.filePath,
      run: (): void => {
        writeWhole(file);
      },
    })),
  ];

  for (const step of steps) {
    try {
      const before = beforeOf(step.filePath);

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
            filePath: step.filePath,
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
