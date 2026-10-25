import type { Stats } from 'node:fs';
import { existsSync, lstatSync, readdirSync, readFileSync, readlinkSync, statSync } from 'node:fs';
import { join } from 'node:path';

import type { ProjectFiles } from '#/kernel/contracts';
import type { FileRead } from '#/kernel/entities';
import { FileReadStatus } from '#/kernel/entities';
import { attempted, recognisedFailure } from '#/kernel/utils';
import { isSystemError } from '#/libs/system-error';

// What the file system cannot do for a path reads as undefined, as a shell's test reads it: the
// calls made through it fail only with a system error.
const attempt = <TOutcome>(effect: () => TOutcome): TOutcome | undefined =>
  attempted({
    effect,
    isRecognised: isSystemError,
  });

// A missing path, a loop of links and a path under a file have no stat.
const statOf = (path: string): Stats | undefined => attempt(() => statSync(path));

// A path with no regular file, a folder or a pipe among them, is missing; text is UTF-8.
const read = (path: string): FileRead => {
  if (statOf(path)?.isFile() !== true) {
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

// The regular files below a folder, from it, as `find -type f` lists them: a link is neither
// listed nor followed.
const filesBelow = (input: { folder: string; under: string }): readonly string[] =>
  readdirSync(join(input.folder, input.under), {
    withFileTypes: true,
  }).flatMap((entry) => {
    const path = join(input.under, entry.name);

    if (entry.isDirectory()) {
      return filesBelow({
        folder: input.folder,
        under: path,
      });
    }

    return entry.isFile()
      ? [
          path,
        ]
      : [];
  });

// No folder, or a folder below it that cannot be read, which fails find too, lists nothing.
const listFiles = (folder: string): readonly string[] | undefined =>
  attempt(() =>
    filesBelow({
      folder,
      under: '',
    }),
  );

// As `pwd -P` resolves it, link by link: Bun 1.4.3's realpath takes a backslash in a name for a
// separator.
const LINK_HOPS = 40;

const realFolder = (path: string): string | undefined => {
  if (statOf(path)?.isDirectory() !== true) {
    return undefined;
  }

  const pending = path.split('/');
  let resolved = '';
  // The stat above bounds the walk by the system's own limit of links; the count bounds it should a
  // link change while it walks.
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
      resolved = resolved.slice(0, resolved.lastIndexOf('/'));

      continue;
    }

    const next = `${resolved}/${part}`;

    // every part exists, as the stat above found the folder through them
    if (!lstatSync(next).isSymbolicLink()) {
      resolved = next;

      continue;
    }

    // Stryker disable next-line AssignmentOperator: a link changed during the walk only
    hops += 1;

    const target = readlinkSync(next);

    resolved = target.startsWith('/') ? '' : resolved;
    pending.unshift(...target.split('/'));
  }

  const real = resolved === '' ? '/' : resolved;

  // Stryker disable next-line ConditionalExpression,EqualityOperator: a link changed during the walk only
  return hops > LINK_HOPS ? undefined : real;
};

/** The files as a shell sees them through its links. */
const createNodeProjectFiles = (): ProjectFiles => ({
  exists: (path: string): boolean => existsSync(path),
  isFile: (path: string): boolean => statOf(path)?.isFile() === true,
  isFolder: (path: string): boolean => statOf(path)?.isDirectory() === true,
  listFiles,
  read,
  realFolder,
});

export { createNodeProjectFiles };
