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

// A workspace as its root's manifests declare it: package.json's workspaces, as Bun, npm and Yarn
// read them, and uv's members in pyproject.toml. A glob's folder is a member only when it holds
// the manifest of its kind, as Bun and uv pass over the others; "!" before a glob, or uv's exclude,
// leaves its folders out, and a glob that reaches the project itself or above it reaches nothing.
// Braces are spelled out before a glob is split into folders, as "/" may stand inside them.

const PACKAGE_MANIFEST_NAME = 'package.json';
const PYPROJECT_NAME = 'pyproject.toml';
const NEGATION = '!';
const ANY_DEPTH = '**';
const SKIPPED_FOLDER_NAME = 'node_modules';
const HIDDEN = '.';
const WILDCARDS = /[*?[{]/u;
const ESCAPE = '\\';
const GROUP_OPEN = '{';
const GROUP_CLOSE = '}';
const ALTERNATIVE = ',';

interface Declared {
  /** the globs of the members, a "!" before those left out */
  readonly globs: readonly string[];
  /** the manifest a folder holds to be a member */
  readonly manifest: string;
}

const globsOf = (workspaces: PackageManifestWire['workspaces']): readonly string[] | undefined =>
  Array.isArray(workspaces) ? workspaces : workspaces?.packages;

const declaredOf = (repositoryFolderPath: AbsolutePath): readonly Declared[] => {
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
  /** where the "}" that closes it stands */
  readonly end: number;
  /** where "{" stands */
  readonly start: number;
}

// The first group of braces to close, so the innermost first, or undefined where none closes; a
// character after "\" is taken as it is.
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

// The globs a glob's braces spell out, "{a,b}" as either, in their order. Each glob spelled out, in
// part or in whole, counts toward the bound, so braces upon braces stop there.
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
  /** shared and mutable: one bound on the folders listed covers the whole walk, so every step adds to it */
  listed: number;
  /** the most folders the walk lists */
  readonly maxFolders: number;
  /** the most globs one glob's braces are spelled out into, the partial ones counted */
  readonly maxGlobs: number;
  readonly repositoryFolderPath: AbsolutePath;
}

const pathOf = (input: { folder: string; name: string }): string =>
  input.folder === '' ? input.name : `${input.folder}${PATH_SEPARATOR}${input.name}`;

// What a folder holds that a walk may enter, no package store and nothing hidden among them; a
// folder past the walk's bound, or that cannot be listed, holds nothing.
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
    .filter((name) => name !== SKIPPED_FOLDER_NAME && !name.startsWith(HIDDEN))
    .toSorted(compareText)
    .map((name) =>
      pathOf({
        folder: input.folder,
        name,
      }),
    );
};

const expand = (input: {
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
      ...expand({
        ...input,
        segments: rest,
      }),
      ...childrenOf(input).flatMap((child) =>
        expand({
          ...input,
          folder: child,
        }),
      ),
    ];
  }

  if (!WILDCARDS.test(segment)) {
    return expand({
      ...input,
      folder: pathOf({
        folder: input.folder,
        name: segment,
      }),
      segments: rest,
    });
  }

  // "*" is any name, "?" one character, "{a,b}" either, "[ab]" one of; Bun's glob matches in linear
  // time, where a pattern built from a manifest's glob could backtrack.
  const glob = new Bun.Glob(segment);

  return childrenOf(input)
    .filter((child) => glob.match(child.slice(child.lastIndexOf(PATH_SEPARATOR) + 1)))
    .flatMap((child) =>
      expand({
        ...input,
        folder: child,
        segments: rest,
      }),
    );
};

// A glob of the project's own folders, none above it; one that names the project itself reaches
// ".", which no member's path is.
const isWithin = (glob: string): boolean => !normalizePath(glob).startsWith(PARENT_SEGMENT);

const pathsOf = (input: { globs: readonly string[]; walk: Walk }): ReadonlySet<string> =>
  new Set(
    input.globs
      .flatMap((glob) => [
        ...bracesExpanded({
          glob,
          maxGlobs: input.walk.maxGlobs,
        }),
      ])
      .filter(isWithin)
      .flatMap((glob) =>
        expand({
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
  /** bounds the folders the globs of one look list, so a glob over a vast tree stops there */
  readonly maxFolders: number;
  /** bounds the globs one glob's braces are spelled out into, the partial ones counted */
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
    const members = declaredOf(repositoryFolderPath).flatMap((declared) => {
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
