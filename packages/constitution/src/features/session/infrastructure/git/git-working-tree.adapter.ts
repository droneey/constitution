import { lstatSync, readFileSync, readlinkSync } from 'node:fs';
import { basename, dirname } from 'node:path';

import { sessionsFolderInProject } from '#/kernel/constants';
import { attempted } from '#/kernel/utils';
import { AbsolutePath } from '#/kernel/value-objects';
import type { ChildProcessSettings } from '#/libs/child-process';
import { isSystemError } from '#/libs/system-error';

import type { IgnoredPaths, PathsAmongInput, WorkingTree } from '../../application/contracts';
import { IgnoreStatus } from '../../application/contracts';
import type {
  HeldFiles,
  MainLine,
  TreeSnapshot,
  TreeState,
  UnreadTree,
} from '../../domain/tree-state/entities';
import { TreeStateStatus } from '../../domain/tree-state/entities';
import { FileSignature, TreeFingerprint } from '../../domain/tree-state/value-objects';
import { unknownObjectFormatMessage } from './git-working-tree.messages';
import type { GitRunInput } from './run-git';
import { GitRunStatus, runGit } from './run-git';
import type { WorkContent } from './tree-content.utils';
import {
  GitFileMode,
  HashName,
  treeContentFingerprintOf,
  WorkContentKind,
} from './tree-content.utils';

// Why: the files the hooks write for their sessions are never a change, or what the gate writes
// would hold the hand-back it guards.
const PROJECT_BUT_SESSION_FILES = [
  '--',
  '.',
  `:(exclude)${sessionsFolderInProject}`,
] as const;
const GIT_FOLDER_NAME = '.git';

// Why: git words what it finds in no repository so, in the C locale it is run in.
const NO_REPOSITORY = 'fatal: not a git repository';
// Why: a clone names the remote's main line by this ref, whatever the line is called.
const REMOTE_MAIN_LINE = 'refs/remotes/origin/HEAD';

// Why: rev-parse --verify --quiet ends with 1 when the ref is missing, and merge-base --is-ancestor
// with 1 when HEAD is not an ancestor of it; any other status but 0 is a failure.
const HEAD_NOT_HELD_EXIT_CODE = 1;
// Why: check-ignore answers that git ignores none of the paths by ending with 1, and fails by any
// other status but 0.
const NONE_IGNORED_EXIT_CODE = 1;
const PATH_SEPARATOR = '\0';

const unreadTreeOf = (failure: string): UnreadTree =>
  failure.startsWith(NO_REPOSITORY)
    ? {
        status: TreeStateStatus.NoRepository,
      }
    : {
        reason: failure,
        status: TreeStateStatus.Failed,
      };

const FIELD_SEPARATOR = ' ';

enum StatusEntryKind {
  Changed = '1',
  RenamedOrCopied = '2',
  Unmerged = 'u',
  Untracked = '?',
}

// Why: git's porcelain v2 opens an entry with its kind and the fields that kind has, the path last.
const CHANGED_FIELDS_BEFORE_PATH = 8;
const RENAMED_OR_COPIED_FIELDS_BEFORE_PATH = 9;
const UNMERGED_FIELDS_BEFORE_PATH = 10;
const UNTRACKED_FIELDS_BEFORE_PATH = 1;
const fieldsBeforePathOf: Readonly<Record<StatusEntryKind, number>> = {
  [StatusEntryKind.Changed]: CHANGED_FIELDS_BEFORE_PATH,
  [StatusEntryKind.RenamedOrCopied]: RENAMED_OR_COPIED_FIELDS_BEFORE_PATH,
  [StatusEntryKind.Unmerged]: UNMERGED_FIELDS_BEFORE_PATH,
  [StatusEntryKind.Untracked]: UNTRACKED_FIELDS_BEFORE_PATH,
};

const isStatusEntryKind = (text: string): text is StatusEntryKind =>
  Object.hasOwn(fieldsBeforePathOf, text);

const GONE = 'gone';

const signatureOf = (path: AbsolutePath): FileSignature => {
  const stats = attempted({
    effect: () =>
      lstatSync(path, {
        bigint: true,
      }),
    isRecognised: isSystemError,
  });

  return FileSignature.create(stats === undefined ? GONE : `${stats.size}:${stats.mtimeNs}`);
};

interface ListedFile {
  readonly kind: StatusEntryKind;
  readonly path: string;
}

// Why: in -z output a rename or a copy is followed by its source, as an entry of its own, and the
// last entry ends in a NUL too.
const listedFilesOf = (output: Uint8Array): readonly ListedFile[] => {
  const sources = new Set<number>();

  return new TextDecoder()
    .decode(output)
    .split('\0')
    .flatMap((entry, index) => {
      if (sources.has(index)) {
        return [
          {
            kind: StatusEntryKind.RenamedOrCopied,
            path: entry,
          },
        ];
      }

      const kind = entry.charAt(0);

      if (!isStatusEntryKind(kind)) {
        return [];
      }

      if (kind === StatusEntryKind.RenamedOrCopied) {
        sources.add(index + 1);
      }

      return [
        {
          kind,
          path: entry.split(FIELD_SEPARATOR).slice(fieldsBeforePathOf[kind]).join(FIELD_SEPARATOR),
        },
      ];
    });
};

interface SignedFile extends ListedFile {
  readonly filePath: AbsolutePath;
  readonly signature: FileSignature;
}

type Listing =
  | {
      readonly files: readonly SignedFile[];
      readonly hashName: HashName;
      readonly status: TreeStateStatus.Read;
    }
  | UnreadTree;

// Why: git names the hash of its objects by the repository's object format, spelled as the hash's
// own name.
const parseHashName = (format: string): HashName | undefined =>
  Object.values(HashName).find((name) => name === format);

const listingOf = (input: GitRunInput): Listing => {
  // Why: git names the paths of the status from the top of the repository, which may lie above the
  // project, and names each object by the hash its repository's object format gives.
  const topLevel = runGit({
    ...input,
    args: [
      'rev-parse',
      '--show-toplevel',
      '--show-object-format',
    ],
  });

  if (topLevel.status === GitRunStatus.Failed) {
    return unreadTreeOf(topLevel.failure);
  }

  const listed = runGit({
    ...input,
    args: [
      'status',
      '--porcelain=v2',
      '-z',
      '--untracked-files=all',
      ...PROJECT_BUT_SESSION_FILES,
    ],
  });

  if (listed.status === GitRunStatus.Failed) {
    return unreadTreeOf(listed.failure);
  }

  const named = new TextDecoder().decode(topLevel.output).trimEnd();
  const lastLine = named.lastIndexOf('\n');
  const format = named.slice(lastLine + 1);
  const hashName = parseHashName(format);

  if (hashName === undefined) {
    return {
      reason: unknownObjectFormatMessage(format),
      status: TreeStateStatus.Failed,
    };
  }

  const topLevelFolderPath = AbsolutePath.create(named.slice(0, lastLine));

  return {
    files: listedFilesOf(listed.output).map((file) => {
      const filePath = AbsolutePath.join(topLevelFolderPath, file.path);

      return {
        ...file,
        filePath,
        signature: signatureOf(filePath),
      };
    }),
    hashName,
    status: TreeStateStatus.Read,
  };
};

const mainLineOf = (input: GitRunInput): MainLine => {
  const ref = runGit({
    ...input,
    args: [
      'rev-parse',
      '--verify',
      '--quiet',
      REMOTE_MAIN_LINE,
    ],
  });
  const ancestry =
    ref.status === GitRunStatus.Ran
      ? runGit({
          ...input,
          args: [
            'merge-base',
            '--is-ancestor',
            'HEAD',
            REMOTE_MAIN_LINE,
          ],
        })
      : ref;

  if (ancestry.status === GitRunStatus.Ran || ancestry.exitCode === HEAD_NOT_HELD_EXIT_CODE) {
    return {
      isHeadHeld: ancestry.status === GitRunStatus.Ran,
      status: TreeStateStatus.Read,
    };
  }

  return unreadTreeOf(ancestry.failure);
};

const snapshotOf = (input: GitRunInput): TreeSnapshot => {
  const listing = listingOf(input);

  return listing.status === TreeStateStatus.Read
    ? {
        fileSignatures: new Map(
          listing.files.map((file) => [
            file.filePath,
            file.signature,
          ]),
        ),
        status: TreeStateStatus.Read,
      }
    : listing;
};

const OWNER_EXECUTE = 0o100;
// Why: a file past this size, as a built artefact, is named by its signature, so no hook reads it
// whole each time it looks at the tree.
const MAX_READ_BYTES = 8_388_608;

const modeOfFile = (mode: number): GitFileMode.Executable | GitFileMode.Regular =>
  (mode & OWNER_EXECUTE) === 0 ? GitFileMode.Regular : GitFileMode.Executable;

// Why: git records a link by its target and a file by its bytes and its owner's execute bit; a
// folder where git tracked a file is the file gone, and a file that cannot be read is named by its
// signature, as is one too large to read, so a change to it still changes the tree. A submodule is
// such a folder too, so a move of the commit it has checked out leaves the fingerprint as it was.
const readWorkContent = (path: AbsolutePath): WorkContent => {
  const stats = attempted({
    effect: () => lstatSync(path),
    isRecognised: isSystemError,
  });

  if (stats === undefined || stats.isDirectory()) {
    return {
      kind: WorkContentKind.Gone,
    };
  }

  const isLink = stats.isSymbolicLink();
  const bytes =
    stats.size > MAX_READ_BYTES
      ? undefined
      : attempted({
          effect: () =>
            isLink ? new TextEncoder().encode(readlinkSync(path)) : readFileSync(path),
          isRecognised: isSystemError,
        });

  return {
    bytes: bytes ?? new TextEncoder().encode(signatureOf(path)),
    kind: WorkContentKind.Read,
    mode: isLink ? GitFileMode.Link : modeOfFile(stats.mode),
  };
};

const stateOf = (input: GitRunInput): TreeState => {
  const listing = listingOf(input);

  if (listing.status !== TreeStateStatus.Read) {
    return listing;
  }

  // Why: the index names the content of every file git tracks, and the status each file whose work
  // copy differs from it, read here; ls-files is git's plumbing, which takes no lock on the index
  // and runs no program the user's configuration names to filter a file.
  const index = runGit({
    ...input,
    args: [
      'ls-files',
      '--stage',
      '-z',
      '--full-name',
      ...PROJECT_BUT_SESSION_FILES,
    ],
  });

  if (index.status === GitRunStatus.Failed) {
    return unreadTreeOf(index.failure);
  }

  return {
    fingerprint: TreeFingerprint.create(
      treeContentFingerprintOf({
        hashName: listing.hashName,
        indexListing: index.output,
        workFiles: listing.files.map((file) => ({
          content: readWorkContent(file.filePath),
          path: file.path,
        })),
      }),
    ),
    status: TreeStateStatus.Read,
  };
};

// Why: with -z, check-ignore reads its paths and names the ignored ones each ended by a NUL, so a
// name that holds a line break is told whole, in one run for every path.
const ignoredAmong = (input: ChildProcessSettings & PathsAmongInput): IgnoredPaths => {
  if (input.paths.length === 0) {
    return {
      paths: new Set(),
      status: IgnoreStatus.Told,
    };
  }

  const run = runGit({
    ...input,
    args: [
      'check-ignore',
      '--stdin',
      '-z',
    ],
    stdin: input.paths.map((path) => `${path}${PATH_SEPARATOR}`).join(''),
  });

  if (run.status === GitRunStatus.Ran) {
    const named = new Set(new TextDecoder().decode(run.output).split(PATH_SEPARATOR));

    return {
      paths: new Set(input.paths.filter((path) => named.has(path))),
      status: IgnoreStatus.Told,
    };
  }

  return run.exitCode === NONE_IGNORED_EXIT_CODE
    ? {
        paths: new Set(),
        status: IgnoreStatus.Told,
      }
    : {
        status: IgnoreStatus.Unknown,
      };
};

// Why: ls-files takes its paths only as arguments, which a long list would overrun, so it lists
// the tracked and the unignored files of the project once, and the paths asked are found among them.
const heldAmong = (input: ChildProcessSettings & PathsAmongInput): HeldFiles => {
  if (input.paths.length === 0) {
    return {
      paths: new Set(),
      status: TreeStateStatus.Read,
    };
  }

  const run = runGit({
    ...input,
    args: [
      'ls-files',
      '-z',
      '--cached',
      '--others',
      '--exclude-standard',
    ],
  });

  if (run.status === GitRunStatus.Failed) {
    return unreadTreeOf(run.failure);
  }

  const named = new Set(
    new TextDecoder()
      .decode(run.output)
      .split(PATH_SEPARATOR)
      .map((path) => AbsolutePath.join(input.repositoryFolderPath, path)),
  );

  return {
    paths: new Set(input.paths.filter((path) => named.has(path))),
    status: TreeStateStatus.Read,
  };
};

const createGitWorkingTree = (input: ChildProcessSettings): WorkingTree => ({
  heldAmong: (asked: PathsAmongInput): HeldFiles =>
    heldAmong({
      ...input,
      ...asked,
    }),
  ignoredAmong: (asked: PathsAmongInput): IgnoredPaths =>
    ignoredAmong({
      ...input,
      ...asked,
    }),
  mainCheckoutOf: (folderPath: AbsolutePath): AbsolutePath | undefined => {
    const run = runGit({
      ...input,
      args: [
        'rev-parse',
        '--path-format=absolute',
        '--git-common-dir',
      ],
      repositoryFolderPath: folderPath,
    });

    // Stryker disable next-line ConditionalExpression,BlockStatement: a failed run keeps no output, and no output names a main checkout either way
    if (run.status === GitRunStatus.Failed) {
      return undefined;
    }

    const common = new TextDecoder().decode(run.output).trimEnd();

    // Why: a main checkout's git folder is the .git inside it, and a bare repository has no checkout.
    return basename(common) === GIT_FOLDER_NAME ? AbsolutePath.create(dirname(common)) : undefined;
  },
  mainLineOf: (repositoryFolderPath: AbsolutePath): MainLine =>
    mainLineOf({
      ...input,
      repositoryFolderPath,
    }),
  snapshotOf: (repositoryFolderPath: AbsolutePath): TreeSnapshot =>
    snapshotOf({
      ...input,
      repositoryFolderPath,
    }),
  stateOf: (repositoryFolderPath: AbsolutePath): TreeState =>
    stateOf({
      ...input,
      repositoryFolderPath,
    }),
});

export { createGitWorkingTree };
