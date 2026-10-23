import { Axis, Layer } from '#/kernel/constants';

import type { ProjectUnit, Resolution } from '../../../entities';
import type { Naming } from './named.utils';
import { namedOf } from './named.utils';
import type { Parts, SourcePath } from './parts.utils';
import { keyOf } from './parts.utils';

const COMMON = 'common';
const SELF = 'self';
const CORE = 'core';
const WORKSPACE = 'workspace';
const AXES: readonly Axis[] = [
  Axis.Foundation,
  Axis.Architecture,
  Axis.Workflow,
];
// The rule the wiring holds; a unit whose overrides lower it is left out of the check.
const RULE = 'configuration-takes-every-part-of-its-blocks';

// The blocks and axes of one unit, or of several joined.
interface Reach {
  readonly axes: ReadonlySet<string>;
  readonly blocks: ReadonlySet<string>;
}

// A part a template takes: <scope>, <tool>, <axis>, <name>.
interface Part {
  readonly axis: string;
  readonly name: string;
  readonly scope: string;
  readonly tool: string;
}

interface WiringContext {
  readonly blocks: readonly string[];
  readonly content: (path: string) => string;
  // per template path, the folders of the project that hold a file at it
  readonly folders: ReadonlyMap<string, ReadonlySet<string>>;
  readonly hasFolder: (input: { folder: string; path: string }) => boolean;
  readonly naming: Naming;
  readonly parts: Parts;
  // a part's text, '' when it cannot be read
  readonly readPart: (file: SourcePath) => string;
  readonly resolution: Resolution;
  // the blocks the repository takes
  readonly rootBlocks: ReadonlySet<string>;
  // per path, the unit there; the repository's is ''
  readonly unitAt: ReadonlyMap<string, ProjectUnit>;
}

const shortOf = (part: Part): string => `${part.scope}/${part.axis}/${part.name}`;

const isLowered = (unit: ProjectUnit): boolean => unit.lowered.has(RULE);

const unitNameOf = (unit: ProjectUnit): string => (unit.scope === 0 ? '.' : unit.path);

const parentOf = (folder: string): string => folder.split('/').slice(0, -1).join('/');

const isBeneath = (input: { folder: string; path: string }): boolean =>
  input.folder === '' || `${input.path}/`.startsWith(`${input.folder}/`);

// The unit a folder lies in: the nearest unit at or above it, the repository, at '', last.
const ownerOf = (input: { context: WiringContext; folder: string }): ProjectUnit =>
  input.context.unitAt.get(input.folder) ??
  ownerOf({
    context: input.context,
    folder: parentOf(input.folder),
  });

const fileOf = (input: { folder: string; path: string }): string =>
  input.folder === '' ? input.path : `${input.folder}/${input.path}`;

const reachOf = (units: readonly ProjectUnit[]): Reach => ({
  axes: new Set(units.flatMap((unit) => unit.axes)),
  blocks: new Set(
    units.flatMap((unit) => [
      ...unit.blocks,
    ]),
  ),
});

// common, then the languages a reach holds, in the order of the blocks.
const scopesOf = (input: { context: WiringContext; reach: Reach }): readonly string[] => [
  COMMON,
  ...input.context.resolution.blocks
    .filter((block) => block.layer === Layer.Language && input.reach.blocks.has(block.id))
    .map((block) => block.id),
];

// self, core and the parts of a scope's language are taken wherever the scope is.
const isTaken = (input: { id: string; reach: Reach }): boolean =>
  input.id === SELF || input.id === CORE || input.reach.blocks.has(input.id);

interface ToolAxis {
  readonly axis: string;
  readonly context: WiringContext;
  readonly scope: string;
  readonly tool: string;
}

// A chained tool takes every link the parts it takes extend, as far as the chain runs.
const withLinks = (
  input: ToolAxis & {
    names: readonly string[];
    taken: ReadonlySet<string>;
  },
): ReadonlySet<string> => {
  const { links, partAt } = input.context.parts;
  const taken = new Set(input.taken);
  const keyOfName = (name: string): string => keyOf(input.scope, input.tool, input.axis, name);
  const linkOf = (name: string): string => links.get(keyOfName(name)) ?? '';

  for (const id of input.names.filter((name) => taken.has(name))) {
    for (let next = linkOf(id); next !== '' && !taken.has(next); next = linkOf(next)) {
      if (partAt.has(keyOfName(next))) {
        taken.add(next);
      }
    }
  }

  return taken;
};

// The parts of a tool a reach takes on an axis: self, core, its scope's own, then those of its
// blocks in their order; a chained tool takes every link its parts extend as well.
const partsOf = (
  input: ToolAxis & {
    reach: Reach;
  },
): readonly Part[] => {
  const { axis, context, scope, tool } = input;
  const names = [
    ...(context.parts.names.get(keyOf(scope, tool, axis)) ?? new Set()),
  ];
  const chosen = new Set(
    names.filter((id) =>
      isTaken({
        id,
        reach: input.reach,
      }),
    ),
  );
  const taken = context.parts.chainTools.has(tool)
    ? withLinks({
        ...input,
        names,
        taken: chosen,
      })
    : chosen;
  // a name is taken only when the tool has a part of it
  const own = [
    taken.has(SELF) ? SELF : '',
    taken.has(CORE) ? CORE : '',
    scope !== COMMON && taken.has(scope) ? scope : '',
  ].filter((name) => name !== '');
  const ids = context.blocks.filter(
    (id) => id !== SELF && id !== CORE && id !== scope && taken.has(id),
  );

  return [
    ...own,
    ...ids,
  ].map((name) => ({
    axis,
    name,
    scope,
    tool,
  }));
};

const hasFragmentAt = (input: {
  context: WiringContext;
  path: string;
  scope: string;
  tool: string;
}): boolean =>
  input.context.parts.fragments
    .get(keyOf(input.scope, input.tool))
    ?.some((fragment) => fragment.path === input.path) === true;

// The parts the tool's template at path takes for the units, their blocks and axes joined. The
// root of a workspace runs a tool that has a workspace part only for what crosses its packages:
// there it takes its own part and the workspace's on the axes it follows.
const expectedOf = (input: {
  context: WiringContext;
  isAtRoot: boolean;
  path: string;
  tool: string;
  units: readonly ProjectUnit[];
}): readonly Part[] => {
  const { context, path, tool } = input;
  const reach = reachOf(input.units);
  const isWorkspaceRoot =
    input.isAtRoot && context.rootBlocks.has(WORKSPACE) && context.parts.hasWorkspace.has(tool);

  if (!reach.blocks.has(tool)) {
    return [];
  }

  return scopesOf({
    context,
    reach,
  })
    .filter(
      (scope) =>
        context.parts.tools.has(keyOf(scope, tool)) &&
        hasFragmentAt({
          context,
          path,
          scope,
          tool,
        }),
    )
    .flatMap((scope) =>
      AXES.filter((axis) => reach.axes.has(axis)).flatMap((axis) =>
        partsOf({
          axis,
          context,
          reach,
          scope,
          tool,
        }),
      ),
    )
    .filter((part) => !isWorkspaceRoot || part.name === SELF || part.name === WORKSPACE);
};

const namesPartsOf = (input: { context: WiringContext; file: string; tool: string }): boolean =>
  namedOf({
    isCodeOnly: false,
    naming: input.context.naming,
    text: input.context.content(input.file),
    tool: input.tool,
  }).length > 0;

// The nearest folder at or above the unit whose file of path names the tool's parts, or undefined
// when none does.
const factOf = (input: {
  context: WiringContext;
  path: string;
  tool: string;
  unit: ProjectUnit;
}): string | undefined => {
  const { context, path } = input;

  for (let folder = input.unit.path; ; folder = parentOf(folder)) {
    if (
      context.hasFolder({
        folder,
        path,
      }) &&
      namesPartsOf({
        context,
        file: fileOf({
          folder,
          path,
        }),
        tool: input.tool,
      })
    ) {
      return folder;
    }

    if (folder === '') {
      return undefined;
    }
  }
};

export type { Part, WiringContext };
export {
  expectedOf,
  factOf,
  fileOf,
  isBeneath,
  isLowered,
  ownerOf,
  parentOf,
  RULE,
  reachOf,
  scopesOf,
  shortOf,
  unitNameOf,
};
