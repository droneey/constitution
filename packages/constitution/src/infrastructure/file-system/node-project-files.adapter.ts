import type { Stats } from 'node:fs';
import { existsSync, lstatSync, readdirSync, readFileSync, readlinkSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { PATH_SEPARATOR } from '#/kernel/constants';
import type { ProjectFiles } from '#/kernel/contracts';
import type { FileRead } from '#/kernel/entities';
import { FileReadStatus } from '#/kernel/entities';
import { attempted, recognisedFailure } from '#/kernel/utils';
import { AbsolutePath } from '#/kernel/value-objects';
import { isSystemError } from '#/libs/system-error';

const undefinedOnSystemError = <TOutcome>(effect: () => TOutcome): TOutcome | undefined =>
  attempted({
    effect,
    isRecognised: isSystemError,
  });

const statOf = (path: string): Stats | undefined => undefinedOnSystemError(() => statSync(path));

const isRegularFile = (path: string): boolean => statOf(path)?.isFile() === true;

const isFolder = (path: string): boolean => statOf(path)?.isDirectory() === true;

const read = (path: string): FileRead => {
  if (!isRegularFile(path)) {
    return {
      status: FileReadStatus.Missing,
    };
  }

  try {
    return {
      status: FileReadStatus.Read,
      text: readFileSync(path, 'utf8'),
    };
  } catch (error) {
    return {
      cause: recognisedFailure({
        error,
        isRecognised: isSystemError,
      }),
      status: FileReadStatus.Unreadable,
    };
  }
};

interface WalkInput {
  readonly folderPath: string;
  readonly found: string[];
  readonly maxFiles: number;
  readonly under: string;
}

// Why: as `find -type f` lists them: a link is neither listed nor followed.
const walkStaysWithinLimit = (input: WalkInput): boolean => {
  for (const entry of readdirSync(join(input.folderPath, input.under), {
    withFileTypes: true,
  })) {
    const path = join(input.under, entry.name);

    if (entry.isDirectory()) {
      if (
        !walkStaysWithinLimit({
          ...input,
          under: path,
        })
      ) {
        return false;
      }

      continue;
    }

    if (entry.isFile()) {
      input.found.push(path);
    }

    if (input.found.length > input.maxFiles) {
      return false;
    }
  }

  return true;
};

const LINK_HOPS = 40;

// Why: as `pwd -P` resolves it, link by link: Bun 1.4.3's realpath takes a backslash in a name for
// a separator.
const realFolderLinkByLink = (folderPath: AbsolutePath): AbsolutePath | undefined => {
  if (!isFolder(folderPath)) {
    return undefined;
  }

  const pending = folderPath.split(PATH_SEPARATOR);
  let resolved = '';
  // Why: the stat above bounds the walk by the system's own limit of links; the count bounds it
  // should a link change while it walks.
  let hops = 0;

  for (
    let part = pending.shift();
    // Stryker disable next-line ConditionalExpression,EqualityOperator: a link changed during the walk only
    part !== undefined && hops <= LINK_HOPS;
    part = pending.shift()
  ) {
    if (part === '' || part === '.') {
      continue;
    }

    if (part === '..') {
      resolved = resolved.slice(0, resolved.lastIndexOf(PATH_SEPARATOR));

      continue;
    }

    const next = `${resolved}${PATH_SEPARATOR}${part}`;

    if (!lstatSync(next).isSymbolicLink()) {
      resolved = next;

      continue;
    }

    // Stryker disable next-line AssignmentOperator: a link changed during the walk only
    hops += 1;

    const target = readlinkSync(next);

    resolved = target.startsWith(PATH_SEPARATOR) ? '' : resolved;
    pending.unshift(...target.split(PATH_SEPARATOR));
  }

  const real = resolved === '' ? PATH_SEPARATOR : resolved;

  // Stryker disable next-line ConditionalExpression,EqualityOperator: a link changed during the walk only
  return hops > LINK_HOPS ? undefined : AbsolutePath.create(real);
};

interface NodeProjectFilesInput {
  readonly maxFiles: number;
}

const createNodeProjectFiles = (input: NodeProjectFilesInput): ProjectFiles => ({
  exists: (entryPath: AbsolutePath): boolean => existsSync(entryPath),
  isFile: isRegularFile,
  isFolder,
  listFiles: (folderPath: AbsolutePath): readonly string[] | undefined => {
    const found: string[] = [];
    const isWithin = undefinedOnSystemError(() =>
      walkStaysWithinLimit({
        folderPath,
        found,
        maxFiles: input.maxFiles,
        under: '',
      }),
    );

    return isWithin === true ? found : undefined;
  },
  read,
  realFolder: realFolderLinkByLink,
});

export { createNodeProjectFiles };
