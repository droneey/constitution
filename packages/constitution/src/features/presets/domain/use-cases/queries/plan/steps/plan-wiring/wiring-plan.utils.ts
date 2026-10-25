import { ProjectUnit } from '#/kernel/entities';
import { BlockSource } from '#/kernel/value-objects';

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

const SCOPE_INDENT = '  ';
const PART_INDENT = '    ';

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

const headingOf = (input: {
  context: WiringContext;
  folder: string;
  path: string;
  units: readonly ProjectUnit[];
}): string => {
  const { context, folder, path } = input;
  const isNew = !WiringContext.hasFolder(context, {
    folder,
    path,
  });
  const names = input.units.map(ProjectUnit.nameOf).join(', ');
  const lowers = ProjectUnit.isLowered(ownerOf(input), wiringRule)
    ? ` (its overrides lower ${wiringRule})`
    : '';

  return `${fileOf(input)}${isNew ? ' (new)' : ''} for ${names}${lowers}`;
};

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

const templateLines = (
  input: FolderInput & {
    entry: ToolUnits;
    scope: string;
  },
): readonly string[] => {
  const { context, entry, folder, path, scope } = input;
  const adds = folder !== '' && !holdsBlock(context.rootBlocks, entry.tool);

  return Parts.fragmentsOf(context.parts, {
    scope,
    tool: entry.tool,
  })
    .filter((fragment) => fragment.path === path)
    .flatMap((fragment) => [
      `${SCOPE_INDENT}${entry.tool} ${fragment.at}${adds ? ' (the folder adds it)' : ''}`,
      ...(fragment.takes === Takes.Nothing
        ? []
        : expectedOf({
            context,
            isAtRoot: folder === '',
            path,
            tool: entry.tool,
            units: entry.units,
          })
            .filter((part) => part.scope === scope)
            .map(
              (part) =>
                `${PART_INDENT}${namePathOf({
                  // Stryker disable ObjectLiteral,StringLiteral: every part taken has its file
                  file: Parts.fileOf(context.parts, part) ?? {
                    path: '',
                    source: BlockSource.create(),
                  },
                  // Stryker restore ObjectLiteral,StringLiteral
                  folder,
                })}`,
            )),
    ]);
};

const folderLines = (input: FolderInput): readonly string[] => {
  const { context } = input;
  const tools = toolUnitsOf(input);
  const units = context.resolution.units.filter((unit) =>
    tools.some((entry) => entry.units.includes(unit)),
  );
  const lines = scopesOf({
    context,
    reach: reachOf(units),
  }).flatMap((scope) =>
    tools
      .filter(
        (entry) =>
          entry.units.length > 0 &&
          scopesOf({
            context,
            reach: reachOf(entry.units),
          }).includes(scope),
      )
      .flatMap((entry) =>
        templateLines({
          ...input,
          entry,
          scope,
        }),
      ),
  );

  return lines.length === 0
    ? []
    : [
        headingOf({
          ...input,
          units,
        }),
        ...lines,
      ];
};

// The files a project's tools read, each with the units it serves, each tool's template and the
// parts it takes in their order; then the tools of the release that have no template. A unit that
// keeps no file of a path is planned one in its own folder.
const planWiringOf = (context: WiringContext): readonly string[] => {
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
      folderLines({
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
      context.blocks.flatMap((tool) => {
        const at = {
          scope,
          tool,
        };

        return unit.blocks.has(tool) &&
          Parts.hasTool(context.parts, at) &&
          Parts.fragmentsOf(context.parts, at).length === 0
          ? [
              `no template: ${scope}/${tool} — wire presets/${scope}/${tool}/ from what the tool reads`,
            ]
          : [];
      }),
    ),
  );

  return [
    ...files,
    ...new Set(untemplated),
  ];
};

export { planWiringOf };
