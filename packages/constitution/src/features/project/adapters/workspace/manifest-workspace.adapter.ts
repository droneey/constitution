import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import type { ZodType } from 'zod';

import { attempted, compareText, isSyntaxError, normalizePath } from '#/kernel/utils';
import { UnitPath } from '#/kernel/value-objects';
import { isSystemError } from '#/libs/system-error';

import type { Workspace } from '../../domain/contracts';
import type { PackageManifestWire } from './models';
import { packageManifestModel, pyprojectModel } from './models';

// A workspace as its root's manifests declare it: package.json's workspaces, as Bun, npm and Yarn
// read them, and uv's members in pyproject.toml. A glob's folder is a member only when it holds
// the manifest of its kind, as Bun and uv pass over the others; "!" before a glob, or uv's exclude,
// leaves its folders out, and a glob that reaches the project itself or above it reaches nothing.

const PACKAGE_MANIFEST = 'package.json';
const PYPROJECT = 'pyproject.toml';
const NEGATION = '!';
const ANY_DEPTH = '**';
const SEPARATOR = '/';
const SKIPPED = 'node_modules';
const HIDDEN = '.';
const PARENT = '..';
const WILDCARDS = /[*?[{]/u;

interface Declared {
  // the globs of the members, a "!" before those left out
  readonly globs: readonly string[];
  // the manifest a folder holds to be a member
  readonly manifest: string;
}

// A manifest that is missing, no JSON or TOML, or not of the shape declares no workspace.
const readModel = <T>(input: {
  model: ZodType<T>;
  parse: (text: string) => unknown;
  path: string;
}): T | undefined => {
  const parsed = attempted<unknown>({
    // Stryker disable next-line StringLiteral: without an encoding Bun gives the bytes, which both parsers read as UTF-8 too
    effect: () => input.parse(readFileSync(input.path, 'utf8')),
    // Stryker disable next-line ConditionalExpression: reading a file fails only by the system and parsing it only by its syntax, so no other failure reaches here
    isRecognised: (error: unknown): boolean => isSystemError(error) || isSyntaxError(error),
  });
  const read = input.model.safeParse(parsed);

  return read.success ? read.data : undefined;
};

const globsOf = (workspaces: PackageManifestWire['workspaces']): readonly string[] | undefined =>
  Array.isArray(workspaces) ? workspaces : workspaces?.packages;

const declaredOf = (project: string): readonly Declared[] => {
  const uv = readModel({
    model: pyprojectModel,
    parse: Bun.TOML.parse,
    path: join(project, PYPROJECT),
  })?.tool?.uv?.workspace;

  const globs = globsOf(
    readModel({
      model: packageManifestModel,
      parse: JSON.parse,
      path: join(project, PACKAGE_MANIFEST),
    })?.workspaces,
  );

  return [
    {
      // Stryker disable next-line ArrayDeclaration: a glob that names no folder declares no member
      globs: globs ?? [],
      manifest: PACKAGE_MANIFEST,
    },
    {
      globs: [
        // Stryker disable next-line ArrayDeclaration: a glob that names no folder declares no member
        ...(uv?.members ?? []),
        // Stryker disable next-line ArrayDeclaration: a glob that names no folder leaves no member out
        ...(uv?.exclude ?? []).map((glob) => `${NEGATION}${glob}`),
      ],
      manifest: PYPROJECT,
    },
  ];
};

interface Walk {
  // the folders listed so far, across the walk, and the most it lists
  listed: number;
  readonly maxFolders: number;
  readonly project: string;
}

const pathOf = (input: { folder: string; name: string }): string =>
  input.folder === '' ? input.name : `${input.folder}${SEPARATOR}${input.name}`;

// What a folder holds that a walk may enter, no package store and nothing hidden among them; a
// folder past the walk's bound, or that cannot be listed, holds nothing.
const childrenOf = (input: { folder: string; walk: Walk }): readonly string[] => {
  const { walk } = input;
  const names =
    walk.listed < walk.maxFolders
      ? attempted({
          effect: () => readdirSync(join(walk.project, input.folder)),
          isRecognised: isSystemError,
        })
      : undefined;

  walk.listed += 1;

  // Stryker disable next-line ArrayDeclaration: a name the folder does not hold reaches no member
  return (names ?? [])
    .filter((name) => name !== SKIPPED && !name.startsWith(HIDDEN))
    .toSorted(compareText)
    .map((name) =>
      pathOf({
        folder: input.folder,
        name,
      }),
    );
};

// The paths a glob's segments reach from a folder, from the project's.
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
    .filter((child) => glob.match(child.slice(child.lastIndexOf(SEPARATOR) + 1)))
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
const isWithin = (glob: string): boolean => !normalizePath(glob).startsWith(PARENT);

const pathsOf = (input: { globs: readonly string[]; walk: Walk }): ReadonlySet<string> =>
  new Set(
    input.globs.filter(isWithin).flatMap((glob) =>
      expand({
        folder: '',
        segments: normalizePath(glob)
          .split(SEPARATOR)
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
}

const createManifestWorkspace = (input: ManifestWorkspaceInput): Workspace => ({
  membersOf: (project: string): readonly UnitPath[] => {
    const walk: Walk = {
      listed: 0,
      maxFolders: input.maxFolders,
      project,
    };
    const members = declaredOf(project).flatMap((declared) => {
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
        (folder) => !excluded.has(folder) && isFile(join(project, folder, declared.manifest)),
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
