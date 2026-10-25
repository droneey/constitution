import { ProjectUnit } from '#/kernel/entities';

import type {
  PlannedFile,
  PlannedScope,
  PlannedTool,
  UntemplatedTool,
  WiringPlan,
} from '../../../../../entities';
import { Parts, Takes, WiringContext } from '../../../../../entities';
import {
  expectedOf,
  fileOf,
  holdsBlock,
  isRepositoryTool,
  namePathOf,
  ownerOf,
  reachOf,
  scopesOf,
  wiringRule,
} from '../../../shared/wiring';

// The folder whose file at path serves a unit that takes the tool: the unit's own when the tool's
// template there takes parts, since a configuration serves only the unit it lies in; else the
// nearest folder at or above the unit that keeps the file, which the tool reads by its name, or the
// unit's own when none does.
const homeOf = (input: {
  context: WiringContext;
  path: string;
  tool: string;
  unit: ProjectUnit;
}): string => {
  const { context, path, unit } = input;
  const segments = unit.path.split('/');
  const above = [
    ...segments.map((_, index) => segments.slice(0, segments.length - index).join('/')),
    '',
  ];

  return Parts.takesAt(context.parts, {
    path,
    tool: input.tool,
  }) === Takes.Nothing
    ? (above.find((folder) =>
        WiringContext.hasFolder(context, {
          folder,
          path,
        }),
      ) ?? unit.path)
    : unit.path;
};

// The units a file serves for a tool: those that take it and whose file it is; the root's file of
// a tool no member follows serves every unit.
const unitsOf = (input: {
  context: WiringContext;
  folder: string;
  path: string;
  tool: string;
}): readonly ProjectUnit[] =>
  input.context.resolution.units.filter((unit) =>
    holdsBlock(unit.blocks, input.tool)
      ? homeOf({
          ...input,
          unit,
        }) === input.folder
      : input.folder === '' &&
        holdsBlock(input.context.rootBlocks, input.tool) &&
        isRepositoryTool(input),
  );

interface ToolUnits {
  readonly tool: string;
  readonly units: readonly ProjectUnit[];
}

interface FolderInput {
  readonly context: WiringContext;
  readonly folder: string;
  readonly path: string;
}

const toolUnitsOf = (input: FolderInput): readonly ToolUnits[] => {
  const { context, path } = input;

  return context.blocks
    .filter((tool) =>
      Parts.gives(context.parts, {
        path,
        tool,
      }),
    )
    .map((tool) => ({
      tool,
      units: unitsOf({
        ...input,
        tool,
      }),
    }));
};

const plannedToolsOf = (
  input: FolderInput & {
    entry: ToolUnits;
    scope: string;
  },
): readonly PlannedTool[] => {
  const { context, entry, folder, path, scope } = input;
  const isAdded = folder !== '' && !holdsBlock(context.rootBlocks, entry.tool);

  return Parts.fragmentsOf(context.parts, {
    scope,
    tool: entry.tool,
  })
    .filter((fragment) => fragment.path === path)
    .map((fragment) => ({
      isAdded,
      parts:
        fragment.takes === Takes.Nothing
          ? []
          : expectedOf({
              context,
              isAtRoot: folder === '',
              path,
              tool: entry.tool,
              units: entry.units,
            })
              .filter(({ address }) => address.scope === scope)
              .map(({ file }) =>
                namePathOf({
                  file,
                  folder,
                }),
              ),
      template: fragment.at,
      tool: entry.tool,
    }));
};

const plannedFilesOf = (input: FolderInput): readonly PlannedFile[] => {
  const { context, folder, path } = input;
  const tools = toolUnitsOf(input);
  const units = context.resolution.units.filter((unit) =>
    tools.some((entry) => entry.units.includes(unit)),
  );
  const scopes = scopesOf({
    context,
    reach: reachOf(units),
  })
    .map(
      (scope): PlannedScope => ({
        scope,
        tools: tools
          .filter(
            (entry) =>
              entry.units.length > 0 &&
              scopesOf({
                context,
                reach: reachOf(entry.units),
              }).includes(scope),
          )
          .flatMap((entry) =>
            plannedToolsOf({
              ...input,
              entry,
              scope,
            }),
          ),
      }),
    )
    .filter((planned) => planned.tools.length > 0);

  return scopes.length === 0
    ? []
    : [
        {
          file: fileOf(input),
          isNew: !WiringContext.hasFolder(context, {
            folder,
            path,
          }),
          ...(ProjectUnit.isLowered(ownerOf(input), wiringRule)
            ? {
                lowers: wiringRule,
              }
            : {}),
          scopes,
          units: units.map((unit) => unit.path),
        },
      ];
};

// The files a project's tools read, each with the units it serves, each tool's template and the
// parts it takes in their order; then the tools of the release that have no template. A unit that
// keeps no file of a path is planned one in its own folder.
const planWiringOf = (context: WiringContext): WiringPlan => {
  const files = context.parts.paths.flatMap((path) => {
    const kept = WiringContext.foldersAt(context, path);
    const folders = [
      ...new Set([
        '',
        ...kept,
        ...context.resolution.units.map((unit) => unit.path),
      ]),
    ];

    return folders.flatMap((folder) =>
      plannedFilesOf({
        context,
        folder,
        path,
      }),
    );
  });
  const untemplated = context.resolution.units.flatMap((unit) =>
    scopesOf({
      context,
      reach: reachOf([
        unit,
      ]),
    }).flatMap((scope) =>
      context.blocks.flatMap((tool): readonly UntemplatedTool[] => {
        const at = {
          scope,
          tool,
        };

        return unit.blocks.has(tool) &&
          Parts.hasTool(context.parts, at) &&
          Parts.fragmentsOf(context.parts, at).length === 0
          ? [
              at,
            ]
          : [];
      }),
    ),
  );

  return {
    files,
    untemplated: [
      ...new Map(
        untemplated.map((tool) => [
          `${tool.scope}/${tool.tool}`,
          tool,
        ]),
      ).values(),
    ],
  };
};

export { planWiringOf };
