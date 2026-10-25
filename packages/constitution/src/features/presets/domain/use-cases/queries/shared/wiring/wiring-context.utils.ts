import type { Axis } from '#/kernel/constants';
import { AXES, COMMON_SCOPE, Layer, SELF_PART, WORKSPACE_PART } from '#/kernel/constants';
import type { FileRead } from '#/kernel/entities';
import { FileReadStatus, ProjectUnit } from '#/kernel/entities';
import { BlockId, coreBlockId, PartAddress, RuleSlug } from '#/kernel/value-objects';

import type { PresetPart } from '../../../../entities';
import { Parts, WiringContext } from '../../../../entities';
import { namedOf } from './named.utils';

// The rule the wiring holds; a unit whose overrides lower it is left out of the check.
const wiringRule = RuleSlug.create('configuration-takes-every-part-of-its-blocks');

interface Reach {
  readonly axes: ReadonlySet<string>;
  readonly blocks: ReadonlySet<BlockId>;
}

interface WiringReads {
  /** a file of the project, by its path from the project */
  readonly content: (path: string) => FileRead;
}

const holdsBlock = (blocks: ReadonlySet<BlockId>, name: string): boolean =>
  BlockId.is(name) && blocks.has(name);

interface PathInFolder {
  readonly folder: string;
  readonly path: string;
}

const isBeneath = (input: PathInFolder): boolean =>
  input.folder === '' || `${input.path}/`.startsWith(`${input.folder}/`);

interface OwnerInput {
  readonly context: WiringContext;
  readonly folder: string;
}

// The unit a folder lies in: the deepest unit at or above it, the repository, at '', at the least.
const ownerOf = (input: OwnerInput): ProjectUnit =>
  input.context.resolution.units
    .filter((unit) =>
      isBeneath({
        folder: unit.path,
        path: input.folder,
      }),
    )
    .reduce((nearest, unit) =>
      // Stryker disable next-line EqualityOperator: two units at or above one folder never share a length
      unit.path.length > nearest.path.length ? unit : nearest,
    );

const fileOf = (input: PathInFolder): string =>
  input.folder === '' ? input.path : `${input.folder}/${input.path}`;

const reachOf = (units: readonly ProjectUnit[]): Reach => ({
  axes: new Set(units.flatMap((unit) => unit.axes)),
  blocks: new Set(
    units.flatMap((unit) => [
      ...unit.blocks,
    ]),
  ),
});

interface ScopesInput {
  readonly context: WiringContext;
  readonly reach: Reach;
}

// common, then the languages a reach holds, in the order of the blocks.
const scopesOf = (input: ScopesInput): readonly string[] => [
  COMMON_SCOPE,
  ...input.context.resolution.blocks
    .filter((block) => block.layer === Layer.Language && input.reach.blocks.has(block.id))
    .map((block) => block.id),
];

// self, core and the parts of a scope's language are taken wherever the scope is.
const isTaken = (input: { id: string; reach: Reach }): boolean =>
  input.id === SELF_PART || input.id === coreBlockId || holdsBlock(input.reach.blocks, input.id);

interface ToolAxis {
  readonly axis: Axis;
  readonly context: WiringContext;
  readonly scope: string;
  readonly tool: string;
}

// A chained tool takes every link the parts it takes extend, as far as the chain runs; a link with
// no part of its own is taken in name alone, and so adds no part.
const withLinks = (
  input: ToolAxis & {
    names: readonly string[];
    taken: ReadonlySet<string>;
  },
): ReadonlySet<string> => {
  const { parts } = input.context;
  const taken = new Set(input.taken);

  const addressOf = (name: string): PartAddress =>
    PartAddress.create({
      axis: input.axis,
      name,
      scope: input.scope,
      tool: input.tool,
    });

  const linkOf = (name: string): string | undefined => Parts.linkOf(parts, addressOf(name));

  for (const id of input.names.filter((name) => taken.has(name))) {
    for (let next = linkOf(id); next !== undefined && !taken.has(next); next = linkOf(next)) {
      taken.add(next);
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
): readonly PresetPart[] => {
  const { axis, context, scope, tool } = input;
  const found = Parts.partsOf(context.parts, {
    axis,
    scope,
    tool,
  });
  const names = found.map((part) => part.address.name);
  const chosen = new Set(
    names.filter((id) =>
      isTaken({
        id,
        reach: input.reach,
      }),
    ),
  );
  const taken = Parts.isChained(context.parts, tool)
    ? withLinks({
        ...input,
        names,
        taken: chosen,
      })
    : chosen;
  // common has no part of its own: one named after it is a block's
  const order = [
    ...[
      SELF_PART,
      coreBlockId,
      scope,
    ].filter((name) => name !== COMMON_SCOPE),
    ...context.blocks.filter(
      (id) => id !== SELF_PART && !BlockId.equals(id, coreBlockId) && id !== scope,
    ),
  ];

  return order
    .filter((name) => taken.has(name))
    .flatMap((name) => found.filter((part) => part.address.name === name));
};

const hasFragmentAt = (input: {
  context: WiringContext;
  path: string;
  scope: string;
  tool: string;
}): boolean =>
  Parts.fragmentsOf(input.context.parts, input).some((fragment) => fragment.path === input.path);

interface ExpectedInput {
  readonly context: WiringContext;
  readonly isAtRoot: boolean;
  readonly path: string;
  readonly tool: string;
  readonly units: readonly ProjectUnit[];
}

// The parts the tool's template at path takes for the units, their blocks and axes joined. The
// root of a workspace runs a tool that has a workspace part only for what crosses its packages:
// there it takes its own part and the workspace's on the axes it follows.
const expectedOf = (input: ExpectedInput): readonly PresetPart[] => {
  const { context, path, tool } = input;
  const reach = reachOf(input.units);
  const isWorkspaceRoot =
    input.isAtRoot &&
    holdsBlock(context.rootBlocks, WORKSPACE_PART) &&
    Parts.hasWorkspacePart(context.parts, tool);

  if (!holdsBlock(reach.blocks, tool)) {
    return [];
  }

  return scopesOf({
    context,
    reach,
  })
    .filter(
      (scope) =>
        Parts.hasTool(context.parts, {
          scope,
          tool,
        }) &&
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
    .filter(
      ({ address }) =>
        !isWorkspaceRoot || address.name === SELF_PART || address.name === WORKSPACE_PART,
    );
};

interface FileOfToolInput {
  readonly context: WiringContext;
  readonly file: string;
  readonly folder: string;
  readonly reads: WiringReads;
  readonly tool: string;
}

// Whether a file of the project names the tool's parts; one that cannot be read may, and is
// warned of apart.
const namesPartsOf = (input: FileOfToolInput): boolean => {
  const read = input.reads.content(input.file);

  return (
    read.status === FileReadStatus.Unreadable ||
    (read.status === FileReadStatus.Read &&
      namedOf({
        folder: input.folder,
        isCodeOnly: false,
        naming: input.context,
        text: read.text,
        tool: input.tool,
      }).length > 0)
  );
};

interface ServingFolderInput {
  readonly context: WiringContext;
  readonly path: string;
  readonly reads: WiringReads;
  readonly tool: string;
  readonly unit: ProjectUnit;
}

// The unit's own folder when its file of path names the tool's parts, or undefined when it does
// not: a configuration serves only the unit it lies in.
const servingFolderOf = (input: ServingFolderInput): string | undefined => {
  const { context, path } = input;
  const folder = input.unit.path;
  const file = fileOf({
    folder,
    path,
  });

  return WiringContext.hasFolder(context, {
    folder,
    path,
  }) &&
    namesPartsOf({
      context,
      file,
      folder,
      reads: input.reads,
      tool: input.tool,
    })
    ? folder
    : undefined;
};

interface RepositoryToolInput {
  readonly context: WiringContext;
  readonly tool: string;
}

// A tool no member follows, only the root: the root's configuration of it serves every unit.
const isRepositoryTool = (input: RepositoryToolInput): boolean =>
  !input.context.resolution.units.some(
    (unit) => !ProjectUnit.isRepository(unit) && holdsBlock(unit.blocks, input.tool),
  );

export type { WiringReads };
export {
  expectedOf,
  fileOf,
  holdsBlock,
  isBeneath,
  isRepositoryTool,
  namesPartsOf,
  ownerOf,
  reachOf,
  scopesOf,
  servingFolderOf,
  wiringRule,
};
