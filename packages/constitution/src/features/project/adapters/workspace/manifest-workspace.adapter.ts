import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { PARENT_SEGMENT, PATH_SEPARATOR } from '#/kernel/constants';
import { attempted, compareText, normalizePath } from '#/kernel/utils';
import type { AbsolutePath } from '#/kernel/value-objects';
import { UnitPath } from '#/kernel/value-objects';
import { readModelFile } from '#/libs/model-file';
import { isSystemError } from '#/libs/system-error';

import type { Workspace } from '../../domain/contracts';
import type { PackageManifestWire } from './models';
import { packageManifestModel, pyprojectModel } from './models';

const PACKAGE_MANIFEST_NAME = 'package.json';
const PYPROJECT_NAME = 'pyproject.toml';
const NEGATION = '!';
const ANY_DEPTH = '**';
const SKIPPED_FOLDER_NAME = 'node_modules';
const HIDDEN_NAME_PREFIX = '.';
const WILDCARDS = /[*?[{]/u;
const ESCAPE = '\\';
const GROUP_OPEN = '{';
const GROUP_CLOSE = '}';
const ALTERNATIVE = ',';

interface Declared {
  readonly globs: readonly string[];
  readonly manifest: string;
}

const globsOf = (workspaces: PackageManifestWire['workspaces']): readonly string[] | undefined =>
  Array.isArray(workspaces) ? workspaces : workspaces?.packages;

// Why: Bun, npm and Yarn read package.json's workspaces, and uv the members in pyproject.toml; Bun
// and uv pass over a folder without its manifest.
const workspaceManifestsOf = (repositoryFolderPath: AbsolutePath): readonly Declared[] => {
  const uv = readModelFile({
    model: pyprojectModel,
    parse: Bun.TOML.parse,
    path: join(repositoryFolderPath, PYPROJECT_NAME),
  })?.tool?.uv?.workspace;

  const globs = globsOf(
    readModelFile({
      model: packageManifestModel,
      parse: JSON.parse,
      path: join(repositoryFolderPath, PACKAGE_MANIFEST_NAME),
    })?.workspaces,
  );

  return [
    {
      // Stryker disable next-line ArrayDeclaration: a glob that names no folder declares no member
      globs: globs ?? [],
      manifest: PACKAGE_MANIFEST_NAME,
    },
    {
      globs: [
        // Stryker disable next-line ArrayDeclaration: a glob that names no folder declares no member
        ...(uv?.members ?? []),
        // Stryker disable next-line ArrayDeclaration: a glob that names no folder leaves no member out
        ...(uv?.exclude ?? []).map((glob) => `${NEGATION}${glob}`),
      ],
      manifest: PYPROJECT_NAME,
    },
  ];
};

interface BraceGroup {
  readonly alternatives: readonly string[];
  readonly end: number;
  readonly start: number;
}

const firstGroupOf = (glob: string): BraceGroup | undefined => {
  let open:
    | {
        readonly alternatives: string[];
        readonly start: number;
      }
    | undefined;
  let from = 0;

  // Stryker disable next-line EqualityOperator: no character stands past the end, so one more turn finds none
  for (let index = 0; index < glob.length; index += 1) {
    const character = glob[index];

    if (character === ESCAPE) {
      index += 1;
    } else if (character === GROUP_OPEN) {
      open = {
        alternatives: [],
        start: index,
      };
      from = index + GROUP_OPEN.length;
    } else if (character === ALTERNATIVE) {
      open?.alternatives.push(glob.slice(from, index));
      from = index + ALTERNATIVE.length;
    } else if (character === GROUP_CLOSE && open !== undefined) {
      return {
        alternatives: [
          ...open.alternatives,
          glob.slice(from, index),
        ],
        end: index,
        start: open.start,
      };
    }
  }

  return undefined;
};

// Why: braces are spelled out before a glob is split into folders, as `/` may stand inside braces.
function* bracesExpanded(input: { glob: string; maxGlobs: number }): Generator<string> {
  const pending = [
    input.glob,
  ];

  for (let spelled = 0; spelled < input.maxGlobs; spelled += 1) {
    const glob = pending.pop();

    if (glob === undefined) {
      return;
    }

    const group = firstGroupOf(glob);

    if (group === undefined) {
      yield glob;

      continue;
    }

    for (const alternative of group.alternatives.toReversed()) {
      pending.push(
        `${glob.slice(0, group.start)}${alternative}${glob.slice(group.end + GROUP_CLOSE.length)}`,
      );
    }
  }
}

interface Walk {
  // Why: shared and mutable: one bound on the folders listed covers the whole walk, so every step
  // adds to it.
  listed: number;
  readonly maxFolders: number;
  readonly maxGlobs: number;
  readonly repositoryFolderPath: AbsolutePath;
}

const pathOf = (input: { folder: string; name: string }): string =>
  input.folder === '' ? input.name : `${input.folder}${PATH_SEPARATOR}${input.name}`;

const childrenOf = (input: { folder: string; walk: Walk }): readonly string[] => {
  const { walk } = input;
  const names =
    walk.listed < walk.maxFolders
      ? attempted({
          effect: () => readdirSync(join(walk.repositoryFolderPath, input.folder)),
          isRecognised: isSystemError,
        })
      : undefined;

  walk.listed += 1;

  // Stryker disable next-line ArrayDeclaration: a name the folder does not hold reaches no member
  return (names ?? [])
    .filter((name) => name !== SKIPPED_FOLDER_NAME && !name.startsWith(HIDDEN_NAME_PREFIX))
    .toSorted(compareText)
    .map((name) =>
      pathOf({
        folder: input.folder,
        name,
      }),
    );
};

const foldersMatching = (input: {
  folder: string;
  segments: readonly string[];
  walk: Walk;
}): readonly string[] => {
  const [segment, ...rest] = input.segments;

  if (segment === undefined) {
    return [
      input.folder,
    ];
  }

  if (segment === ANY_DEPTH) {
    return [
      ...foldersMatching({
        ...input,
        segments: rest,
      }),
      ...childrenOf(input).flatMap((child) =>
        foldersMatching({
          ...input,
          folder: child,
        }),
      ),
    ];
  }

  if (!WILDCARDS.test(segment)) {
    return foldersMatching({
      ...input,
      folder: pathOf({
        folder: input.folder,
        name: segment,
      }),
      segments: rest,
    });
  }

  // Why: Bun's glob matches in linear time, where a pattern built from a manifest's glob could
  // backtrack.
  const glob = new Bun.Glob(segment);

  return childrenOf(input)
    .filter((child) => glob.match(child.slice(child.lastIndexOf(PATH_SEPARATOR) + 1)))
    .flatMap((child) =>
      foldersMatching({
        ...input,
        folder: child,
        segments: rest,
      }),
    );
};

const staysInsideProject = (glob: string): boolean =>
  !normalizePath(glob).startsWith(PARENT_SEGMENT);

const pathsOf = (input: { globs: readonly string[]; walk: Walk }): ReadonlySet<string> =>
  new Set(
    input.globs
      .flatMap((glob) => [
        ...bracesExpanded({
          glob,
          maxGlobs: input.walk.maxGlobs,
        }),
      ])
      .filter(staysInsideProject)
      .flatMap((glob) =>
        foldersMatching({
          folder: '',
          segments: normalizePath(glob)
            .split(PATH_SEPARATOR)
            .filter((segment) => segment !== ''),
          walk: input.walk,
        }),
      ),
  );

const isFile = (path: string): boolean =>
  attempted({
    effect: () => statSync(path).isFile(),
    isRecognised: isSystemError,
  }) === true;

interface ManifestWorkspaceInput {
  readonly maxFolders: number;
  readonly maxGlobs: number;
}

const createManifestWorkspace = (input: ManifestWorkspaceInput): Workspace => ({
  membersOf: (repositoryFolderPath: AbsolutePath): readonly UnitPath[] => {
    const walk: Walk = {
      listed: 0,
      maxFolders: input.maxFolders,
      maxGlobs: input.maxGlobs,
      repositoryFolderPath,
    };
    const members = workspaceManifestsOf(repositoryFolderPath).flatMap((declared) => {
      const excluded = pathsOf({
        globs: declared.globs
          .filter((glob) => glob.startsWith(NEGATION))
          .map((glob) => glob.slice(NEGATION.length)),
        walk,
      });

      return [
        ...pathsOf({
          globs: declared.globs,
          walk,
        }),
      ].filter(
        (folder) =>
          !excluded.has(folder) && isFile(join(repositoryFolderPath, folder, declared.manifest)),
      );
    });

    return [
      ...new Set(members),
    ]
      .toSorted(compareText)
      .filter(UnitPath.is)
      .filter((member) => !UnitPath.isRepository(member));
  },
});

export { createManifestWorkspace };
