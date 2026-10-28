import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { ProgramError } from '#/kernel/errors';

/** entered from its site's folder, as the build enters it */
interface TemporaryRepository {
  /** goes back to the folder the case started in and removes the repository */
  leave: () => void;
  root: string;
}

interface EnterRepositoryInput {
  readonly files?: Readonly<Record<string, string>>;
  readonly folders?: readonly string[];
}

export const enterRepository = (input: EnterRepositoryInput): TemporaryRepository => {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'constitution-')));
  const started = process.cwd();

  for (const folder of [
    'apps/docs',
    ...(input.folders ?? []),
  ]) {
    mkdirSync(join(root, folder), {
      recursive: true,
    });
  }

  for (const [path, text] of Object.entries(input.files ?? {})) {
    mkdirSync(dirname(join(root, path)), {
      recursive: true,
    });
    writeFileSync(join(root, path), text);
  }

  process.chdir(join(root, 'apps/docs'));

  return {
    leave: (): void => {
      process.chdir(started);
      rmSync(root, {
        force: true,
        recursive: true,
      });
    },
    root,
  };
};

/**
 * The code, the details and the name of the cause a read failed with, the code of a failure of the
 * system, or the failure itself when it is neither
 */
export const failureOf = (read: () => unknown): unknown => {
  try {
    return read();
  } catch (error) {
    if (error instanceof ProgramError) {
      return {
        cause: error.cause instanceof Error ? error.cause.name : error.cause,
        code: error.code,
        details: error.details,
      };
    }

    return error instanceof Error && 'code' in error
      ? {
          code: error.code,
        }
      : error;
  }
};
