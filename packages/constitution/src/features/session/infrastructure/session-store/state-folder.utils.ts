import type { Dir } from 'node:fs';
import { chmodSync, lstatSync, mkdirSync, opendirSync, rmSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';

import { attempted } from '#/kernel/utils';
import { isSystemError } from '#/libs/system-error';

const PRIVATE_FOLDER_MODE = 0o700;

enum StateFolderProblem {
  Unnamed = 'unnamed',
  Unsafe = 'unsafe',
  Unwritable = 'unwritable',
}

type StateEnvironment = Readonly<Record<string, string | undefined>>;

type StateFolderWarning =
  | {
      readonly code: StateFolderProblem.Unnamed;
    }
  | {
      readonly code: StateFolderProblem.Unsafe | StateFolderProblem.Unwritable;
      readonly folder: string;
    };

// Why: the XDG Base Directory Specification ignores a relative or empty XDG_STATE_HOME.
const stateHomeOf = (environment: StateEnvironment): string | undefined => {
  const named = environment['XDG_STATE_HOME'];

  if (named !== undefined && isAbsolute(named)) {
    return named;
  }

  const home = environment['HOME'];

  return home !== undefined && isAbsolute(home) ? join(home, '.local', 'state') : undefined;
};

interface OwnedInput {
  readonly folder: string;
  readonly owner: number | undefined;
}

// Why: never a link, and the user's own, as tmux checks its sockets' folder; the mode of a folder
// that existed is narrowed too.
const isOwnedFolder = (input: OwnedInput): boolean => {
  const stats = lstatSync(input.folder);

  if (!stats.isDirectory() || stats.uid !== input.owner) {
    return false;
  }

  chmodSync(input.folder, PRIVATE_FOLDER_MODE);

  return true;
};

interface FoldersInput {
  readonly folders: readonly string[];
  readonly owner: number | undefined;
}

const firstUnsafeFolderOf = (input: FoldersInput): string | undefined => {
  for (const folder of input.folders) {
    mkdirSync(folder, {
      mode: PRIVATE_FOLDER_MODE,
      recursive: true,
    });

    if (
      !isOwnedFolder({
        folder,
        owner: input.owner,
      })
    ) {
      return folder;
    }
  }

  return undefined;
};

interface PrivateFolderInput {
  readonly environment: StateEnvironment;
  readonly names: readonly [
    string,
    string,
  ];
  readonly owner: number | undefined;
  readonly warn: (warning: StateFolderWarning) => void;
}

const privateStateFolder = (input: PrivateFolderInput): string | undefined => {
  const home = stateHomeOf(input.environment);

  if (home === undefined) {
    input.warn({
      code: StateFolderProblem.Unnamed,
    });

    return undefined;
  }

  const [program, name] = input.names;
  const programFolder = join(home, program);
  const folder = join(programFolder, name);
  // Why: an object, since attempted gives undefined for a system error, and unsafe is undefined for
  // none.
  const made = attempted({
    effect: () => ({
      unsafe: firstUnsafeFolderOf({
        folders: [
          programFolder,
          folder,
        ],
        owner: input.owner,
      }),
    }),
    isRecognised: isSystemError,
  });

  if (made === undefined) {
    input.warn({
      code: StateFolderProblem.Unwritable,
      folder,
    });

    return undefined;
  }

  if (made.unsafe !== undefined) {
    input.warn({
      code: StateFolderProblem.Unsafe,
      folder: made.unsafe,
    });

    return undefined;
  }

  return folder;
};

interface SweepInput {
  readonly folder: string;
  // Why: an instant subtracts no days, so the duration is in hours or smaller units.
  readonly kept: Temporal.Duration;
  readonly maxEntries: number;
  readonly now: Temporal.Instant;
}

interface StaleInput {
  readonly path: string;
  readonly since: Temporal.Instant;
}

const isStale = (input: StaleInput): boolean =>
  Temporal.Instant.compare(
    Temporal.Instant.fromEpochNanoseconds(
      lstatSync(input.path, {
        bigint: true,
      }).mtimeNs,
    ),
    input.since,
  ) < 0;

interface ListingInput {
  readonly listing: Dir;
  readonly maxEntries: number;
  readonly since: Temporal.Instant;
}

const sweepListing = (input: ListingInput): void => {
  for (let looked = 0; looked < input.maxEntries; looked += 1) {
    const entry = input.listing.readSync();

    if (entry === null) {
      return;
    }

    const path = join(entry.parentPath, entry.name);

    attempted({
      effect: () => {
        if (
          isStale({
            path,
            since: input.since,
          })
        ) {
          rmSync(path, {
            recursive: true,
          });
        }
      },
      isRecognised: isSystemError,
    });
  }
};

const sweepStale = (input: SweepInput): void => {
  attempted({
    effect: () => {
      // Why: a try and finally, not `using`: constitution.yaml lowers scoped-resource-held-by-using
      // here.
      const listing = opendirSync(input.folder);

      try {
        sweepListing({
          listing,
          maxEntries: input.maxEntries,
          since: input.now.subtract(input.kept),
        });
      } finally /* Stryker disable next-line BlockStatement: Bun's listing holds no descriptor, so one left open leaks nothing a caller sees */ {
        // Stryker disable next-line CallExpression: Bun's listing holds no descriptor, so closing it changes nothing a caller sees
        listing.closeSync();
      }
    },
    isRecognised: isSystemError,
  });
};

const removeOwnedFolder = (input: OwnedInput): void => {
  attempted({
    effect: () => {
      const stats = lstatSync(input.folder);

      if (stats.isDirectory() && stats.uid === input.owner) {
        rmSync(input.folder, {
          recursive: true,
        });
      }
    },
    isRecognised: isSystemError,
  });
};

export type { StateEnvironment, StateFolderWarning };
export { privateStateFolder, removeOwnedFolder, StateFolderProblem, sweepStale };
