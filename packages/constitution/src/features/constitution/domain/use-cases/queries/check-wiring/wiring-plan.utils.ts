import type { ProjectUnit } from '../../../entities';
import { keyOf, Takes } from './parts.utils';
import type { WiringContext } from './wiring-context.utils';
import {
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
  unitNameOf,
} from './wiring-context.utils';

const SCOPE_INDENT = '  ';
const PART_INDENT = '    ';

// The units a file at folder serves by its name: the unit it lies in and each beneath it with no
// nearer file of that name.
const servedByName = (input: {
  context: WiringContext;
  folder: string;
  path: string;
}): ReadonlySet<ProjectUnit> => {
  const { context, folder, path } = input;

  return new Set([
    ownerOf(input),
    ...context.resolution.units.filter((unit) => {
      if (
        !isBeneath({
          folder,
          path: unit.path,
        })
      ) {
        return false;
      }

      for (let nearer = unit.path; nearer !== folder; nearer = parentOf(nearer)) {
        if (
          context.hasFolder({
            folder: nearer,
            path,
          })
        ) {
          return false;
        }
      }

      return true;
    }),
  ]);
};

// The units taking a tool that a file serves for it: those whose nearest file naming the tool's
// parts it is, and, of the units no file names them for, those it serves by its name.
const unitsOf = (input: {
  byName: ReadonlySet<ProjectUnit>;
  context: WiringContext;
  folder: string;
  path: string;
  tool: string;
}): readonly ProjectUnit[] =>
  input.context.resolution.units.filter((unit) => {
    if (!unit.blocks.has(input.tool)) {
      return false;
    }

    const fact = factOf({
      ...input,
      unit,
    });

    return fact === undefined ? input.byName.has(unit) : fact === input.folder;
  });

const headingOf = (input: {
  context: WiringContext;
  folder: string;
  path: string;
  units: readonly ProjectUnit[];
}): string => {
  const { context, folder, path } = input;
  const isNew = !context.hasFolder({
    folder,
    path,
  });
  const names = input.units.map(unitNameOf).join(', ');
  const lowers = isLowered(ownerOf(input)) ? ` (its overrides lower ${RULE})` : '';

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
  const byName = servedByName(input);

  return context.blocks
    .filter((tool) => context.parts.gives.has(keyOf(path, tool)))
    .map((tool) => ({
      tool,
      units: unitsOf({
        ...input,
        byName,
        tool,
      }),
    }));
};

// A tool's templates of a scope at the path, each with the parts it takes there.
const templateLines = (
  input: FolderInput & {
    entry: ToolUnits;
    scope: string;
  },
): readonly string[] => {
  const { context, entry, folder, path, scope } = input;
  const adds = folder !== '' && !context.rootBlocks.has(entry.tool);

  return (
    context.parts.fragments
      .get(keyOf(scope, entry.tool))
      ?.filter((fragment) => fragment.path === path)
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
                  // Stryker disable next-line StringLiteral: every part taken has its path
                  `${PART_INDENT}${context.parts.archivePath.get(keyOf(part.scope, part.tool, part.axis, part.name)) ?? ''}`,
              )),
      ]) ?? []
  );
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
// parts it takes in their order; then the tools of the release that have no template.
const planWiringOf = (context: WiringContext): readonly string[] => {
  const files = context.parts.paths.flatMap((path) => {
    const folders = [
      ...(context.folders.get(path) ?? new Set()),
    ];

    return (
      folders.includes('')
        ? folders
        : [
            '',
            ...folders,
          ]
    ).flatMap((folder) =>
      folderLines({
        context,
        folder,
        path,
      }),
    );
  });
  const seen = new Set<string>();
  const untemplated = context.resolution.units.flatMap((unit) =>
    scopesOf({
      context,
      reach: reachOf([
        unit,
      ]),
    }).flatMap((scope) =>
      context.blocks.flatMap((tool) => {
        const key = keyOf(scope, tool);

        if (
          !(unit.blocks.has(tool) && context.parts.tools.has(key)) ||
          context.parts.fragments.has(key) ||
          seen.has(key)
        ) {
          return [];
        }

        seen.add(key);

        return [
          `no template: ${scope}/${tool} — wire presets/${scope}/${tool}/ from what the tool reads`,
        ];
      }),
    ),
  );

  return [
    ...files,
    ...untemplated,
  ];
};

export { planWiringOf };
