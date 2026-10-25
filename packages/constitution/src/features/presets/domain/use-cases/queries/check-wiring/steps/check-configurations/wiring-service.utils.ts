import type { ProjectWarning } from '#/kernel/entities';
import { ProjectUnit, WarningKind } from '#/kernel/entities';
import type { UnitPath } from '#/kernel/value-objects';

import { Parts, WiringContext } from '../../../../../entities';
import type { WiringReads } from '../../../shared/wiring';
import {
  expectedOf,
  fileOf,
  isBeneath,
  isRepositoryTool,
  namesPartsOf,
  servingFolderOf,
  wiringRule,
} from '../../../shared/wiring';

interface WiringInput {
  readonly context: WiringContext;
  readonly reads: WiringReads;
}

interface Service {
  /** per file, per tool, the units it serves */
  readonly serves: ReadonlyMap<string, ReadonlyMap<string, readonly ProjectUnit[]>>;
  readonly warnings: readonly ProjectWarning[];
}

interface ServiceDraft {
  /** per unit, the tools it needs a file of */
  readonly needs: Map<UnitPath, Set<string>>;
  readonly serves: Map<string, Map<string, ProjectUnit[]>>;
  /** per unit, the tools a file wires for it */
  readonly wired: Map<UnitPath, Set<string>>;
}

const has = (input: {
  map: ReadonlyMap<UnitPath, ReadonlySet<string>>;
  tool: string;
  unit: UnitPath;
}): boolean => input.map.get(input.unit)?.has(input.tool) === true;

const add = (input: { map: Map<UnitPath, Set<string>>; tool: string; unit: UnitPath }): void => {
  input.map.set(input.unit, (input.map.get(input.unit) ?? new Set()).add(input.tool));
};

// Whether a file of the unit's own folders below names the tool's parts; the repository's root
// needs no file of a tool its units configure below it.
const isWiredBelow = (
  input: WiringInput & {
    path: string;
    tool: string;
    unit: ProjectUnit;
  },
): boolean =>
  WiringContext.foldersAt(input.context, input.path).some(
    (folder) =>
      !(input.context.unitAt.has(folder) && !ProjectUnit.isRepository(input.unit)) &&
      isBeneath({
        folder: input.unit.path,
        path: folder,
      }) &&
      namesPartsOf({
        context: input.context,
        file: fileOf({
          folder,
          path: input.path,
        }),
        folder,
        reads: input.reads,
        tool: input.tool,
      }),
  );

// A tool a unit takes, at one of its templates' paths: the file that serves it there, if any. The
// root's file of a tool no member follows serves every unit.
const serveTool = (
  input: WiringInput & {
    draft: ServiceDraft;
    path: string;
    tool: string;
    unit: ProjectUnit;
    units: readonly ProjectUnit[];
  },
): void => {
  const { context, draft, path, tool, unit } = input;
  const unitTool = {
    tool,
    unit: unit.path,
  };

  if (
    has({
      ...unitTool,
      map: draft.wired,
    }) ||
    expectedOf({
      context,
      isAtRoot: false,
      path,
      tool,
      units: [
        unit,
      ],
    }).length === 0
  ) {
    return;
  }

  add({
    ...unitTool,
    map: draft.needs,
  });

  const folder = servingFolderOf(input);

  if (folder === undefined) {
    if (isWiredBelow(input)) {
      add({
        ...unitTool,
        map: draft.wired,
      });
    }

    return;
  }

  const file = fileOf({
    folder,
    path,
  });
  const byTool = draft.serves.get(file) ?? new Map<string, ProjectUnit[]>();

  draft.serves.set(file, byTool);
  byTool.set(tool, [
    ...(byTool.get(tool) ?? []),
    ...(isRepositoryTool({
      context,
      tool,
    })
      ? input.units
      : [
          unit,
        ]),
  ]);
  add({
    ...unitTool,
    map: draft.wired,
  });
};

const nowhereOf = (input: {
  context: WiringContext;
  draft: ServiceDraft;
}): readonly ProjectWarning[] => {
  const { context, draft } = input;

  return context.resolution.units.flatMap((unit) =>
    context.blocks
      .filter(
        (tool) =>
          has({
            map: draft.needs,
            tool,
            unit: unit.path,
          }) &&
          !has({
            map: draft.wired,
            tool,
            unit: unit.path,
          }),
      )
      .map(
        (tool): ProjectWarning => ({
          details: {
            tool,
            unit: unit.path,
          },
          kind: WarningKind.ToolWiredNowhere,
        }),
      ),
  );
};

// For each unit and active tool, the unit's own file that names the tool's parts, or a file of the
// unit's own folders below; the root's file of a tool no member follows serves every unit, so its
// parts are those of all their blocks; a tool no file names for a unit is wired nowhere.
const serveOf = (input: WiringInput): Service => {
  const { context } = input;
  const draft: ServiceDraft = {
    needs: new Map(),
    serves: new Map(),
    wired: new Map(),
  };
  const units = context.resolution.units.filter(
    (candidate) => !ProjectUnit.isLowered(candidate, wiringRule),
  );

  for (const unit of units) {
    for (const path of context.parts.paths) {
      for (const tool of Parts.toolsAt(context.parts, path)) {
        serveTool({
          ...input,
          draft,
          path,
          tool,
          unit,
          units,
        });
      }
    }
  }

  return {
    serves: draft.serves,
    warnings: nowhereOf({
      context,
      draft,
    }),
  };
};

export type { Service, WiringInput };
export { serveOf };
