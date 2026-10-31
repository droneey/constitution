import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { lstatSync } from 'node:fs';
import { basename, dirname } from 'node:path';

import { sessionsFolderInProject } from '#/kernel/constants';
import { attempted } from '#/kernel/utils';
import { AbsolutePath } from '#/kernel/value-objects';
import type { ChildProcessSettings } from '#/libs/child-process';
import { isSystemError } from '#/libs/system-error';

import type {
  IgnoredInput,
  TreeSnapshot,
  TreeState,
  UnreadTree,
  WorkingTree,
} from '../../domain/contracts';
import { IgnoreAnswer, TreeStateStatus } from '../../domain/contracts';
import { FileSignature, TreeFingerprint } from '../../domain/value-objects';
import { gitEndedMessage } from './git-working-tree.messages';

// Why: a diff of a large tree runs past the 1 MiB that spawnSync keeps by default.
const OUTPUT_LIMIT_BYTES = 268_435_456;

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
const cLocale: Readonly<Record<string, string>> = Object.fromEntries([
  [
    'LC_ALL',
    'C',
  ],
]);
// Why: a status refreshes the index under its lock, which fails the user's own git commands that
// write the index meanwhile, unless optional locks are off.
const NO_OPTIONAL_LOCKS = '--no-optional-locks';

// Why: check-ignore answers that git does not ignore a path by ending with 1, and fails by any
// other status but 0.
const NOT_IGNORED_EXIT_CODE = 1;

enum GitRunStatus {
  Ran = 'ran',
  Failed = 'failed',
}

type GitRun =
  | {
      readonly output: Uint8Array;
      readonly status: GitRunStatus.Ran;
    }
  | {
      readonly exitCode: number | undefined;
      readonly failure: string;
      readonly status: GitRunStatus.Failed;
    };

type GitRunInput = ChildProcessSettings & {
  readonly repositoryFolderPath: AbsolutePath;
};

const runGit = (
  input: GitRunInput & {
    readonly args: readonly string[];
  },
): GitRun => {
  const run = spawnSync(
    'git',
    [
      NO_OPTIONAL_LOCKS,
      ...input.args,
    ],
    {
      cwd: input.repositoryFolderPath,
      env: {
        ...input.env,
        ...cLocale,
      },
      maxBuffer: OUTPUT_LIMIT_BYTES,
      timeout: input.timeoutMs,
    },
  );

  if (run.status === 0) {
    return {
      output: run.stdout,
      status: GitRunStatus.Ran,
    };
  }

  const said = run.error?.message ?? new TextDecoder().decode(run.stderr).trim();

  return {
    exitCode: run.status ?? undefined,
    failure: said === '' ? gitEndedMessage(String(run.status ?? run.signal)) : said,
    status: GitRunStatus.Failed,
  };
};

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
      readonly statusOutput: Uint8Array;
      readonly status: TreeStateStatus.Read;
    }
  | UnreadTree;

const listingOf = (input: GitRunInput): Listing => {
  // Why: git names the paths of the status from the top of the repository, which may lie above the
  // project.
  const topLevel = runGit({
    ...input,
    args: [
      'rev-parse',
      '--show-toplevel',
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

  const topLevelFolderPath = AbsolutePath.create(
    new TextDecoder().decode(topLevel.output).trimEnd(),
  );

  return {
    files: listedFilesOf(listed.output).map((file) => {
      const filePath = AbsolutePath.join(topLevelFolderPath, file.path);

      return {
        ...file,
        filePath,
        signature: signatureOf(filePath),
      };
    }),
    status: TreeStateStatus.Read,
    statusOutput: listed.output,
  };
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

const stateOf = (input: GitRunInput): TreeState => {
  const listing = listingOf(input);

  if (listing.status !== TreeStateStatus.Read) {
    return listing;
  }

  // Why: the status names the object in HEAD and in the index of each changed file, the diff of the
  // work tree against the index each tracked file's change, and the signature of each untracked file
  // its rewrite, so the fingerprint needs no commit to diff against. The diff is git's plumbing,
  // which, unlike git diff, takes no lock on the index to refresh it and runs no program the user's
  // configuration names to diff with or to turn a file into text.
  const diff = runGit({
    ...input,
    args: [
      'diff-files',
      '--patch',
      ...PROJECT_BUT_SESSION_FILES,
    ],
  });

  if (diff.status === GitRunStatus.Failed) {
    return unreadTreeOf(diff.failure);
  }

  const untrackedSignatures = listing.files
    .filter((file) => file.kind === StatusEntryKind.Untracked)
    .map((file) => file.signature);

  return {
    fingerprint: TreeFingerprint.create(
      createHash('sha256')
        .update(listing.statusOutput)
        .update(diff.output)
        .update(JSON.stringify(untrackedSignatures))
        .digest('hex'),
    ),
    status: TreeStateStatus.Read,
  };
};

const createGitWorkingTree = (input: ChildProcessSettings): WorkingTree => ({
  isIgnored: (asked: IgnoredInput): IgnoreAnswer => {
    const run = runGit({
      ...input,
      args: [
        'check-ignore',
        '--quiet',
        asked.path,
      ],
      repositoryFolderPath: asked.repositoryFolderPath,
    });

    if (run.status === GitRunStatus.Ran) {
      return IgnoreAnswer.Ignored;
    }

    return run.exitCode === NOT_IGNORED_EXIT_CODE ? IgnoreAnswer.NotIgnored : IgnoreAnswer.Unknown;
  },
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
