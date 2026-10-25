import type { ProjectWarning } from '#/kernel/entities';
import { ProjectUnit, WarningCode } from '#/kernel/entities';
import type { UnitPath } from '#/kernel/value-objects';
import { PartAddress } from '#/kernel/value-objects';

import {
  Parts,
  Takes,
  WiringContext,
  WiringProblem,
  WiringProblemKind,
} from '../../../../../entities';
import type { WiringReads } from '../../../shared/wiring';
import {
  expectedOf,
  fileOf,
  isBeneath,
  isRepositoryTool,
  namedOf,
  ownerOf,
  RATIFY,
  servingFolderOf,
  wiringRule,
} from '../../../shared/wiring';
import { chainProblemsOf, copyProblemsOf } from './problems.utils';

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
      namedOf({
        folder,
        isCodeOnly: false,
        naming: input.context,
        text: input.reads.content(
          fileOf({
            folder,
            path: input.path,
          }),
        ),
        tool: input.tool,
      }).length > 0,
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
      .map((tool) => ({
        code: WarningCode.Wiring,
        message: `${tool} is wired nowhere for ${ProjectUnit.nameOf(unit)}${RATIFY}`,
      })),
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

interface FileCheck {
  readonly isNamed: boolean;
  readonly problems: readonly WiringProblem[];
}

interface ToolCheck {
  readonly missing: readonly string[];
  readonly problems: readonly WiringProblem[];
  readonly stray: readonly string[];
}

interface FileInput extends WiringInput {
  readonly file: string;
  readonly folder: string;
  readonly owner: ProjectUnit;
  readonly path: string;
  readonly serves: Service['serves'];
  readonly text: string;
}

// The units a file serves for a tool: those it is the nearest file for, and the unit it lies in
// when that unit is not one's root and its overrides keep the rule.
const servedUnitsOf = (
  input: FileInput & {
    tool: string;
  },
): readonly ProjectUnit[] => {
  const { context, owner } = input;
  const served = input.serves.get(input.file)?.get(input.tool) ?? [];
  const isOwnerAdded = !(
    context.unitAt.has(input.folder) ||
    ProjectUnit.isLowered(owner, wiringRule) ||
    served.includes(owner)
  );

  return isOwnerAdded
    ? [
        owner,
        ...served,
      ]
    : served;
};

const checkTool = (
  input: FileInput & {
    named: readonly string[];
    tool: string;
  },
): ToolCheck => {
  const { context, path, text, tool } = input;
  const units = servedUnitsOf(input);

  if (units.length === 0) {
    return {
      missing: [],
      problems: [],
      stray: [],
    };
  }

  const expected = expectedOf({
    context,
    isAtRoot: input.folder === '',
    path,
    tool,
    units,
  });
  const shorts = expected.map(PartAddress.shortOf);
  const takes = Parts.takesAt(context.parts, {
    path,
    tool,
  });
  const lines = text.split('\n');

  return {
    missing: shorts.filter((short) => !input.named.includes(short)),
    problems: [
      ...(takes === Takes.Copies
        ? copyProblemsOf({
            context,
            expected: shorts,
            folder: input.folder,
            lines,
            reads: input.reads,
            tool,
          })
        : []),
      ...(takes === Takes.Chains
        ? chainProblemsOf({
            context,
            entries: expected,
            folder: input.folder,
            lines,
            tool,
          })
        : []),
    ],
    stray: namedOf({
      folder: input.folder,
      isCodeOnly: true,
      naming: context,
      text,
      tool,
    }).filter((short) => !shorts.includes(short)),
  };
};

// For every tool whose template writes the file; a tool is tagged when several write it.
const checkFile = (
  input: WiringInput & {
    folder: string;
    path: string;
    serves: Service['serves'];
  },
): FileCheck => {
  const { context, folder, path } = input;
  const file = fileOf({
    folder,
    path,
  });
  const fileInput: FileInput = {
    ...input,
    file,
    owner: ownerOf({
      context,
      folder,
    }),
    text: input.reads.content(file),
  };
  const tools = Parts.toolsAt(context.parts, path);

  const tag = (tool: string): string => (tools.length > 1 ? `${tool}:` : '');

  const checks = tools.flatMap((tool) => {
    const named = namedOf({
      folder,
      isCodeOnly: false,
      naming: context,
      text: fileInput.text,
      tool,
    });

    return named.length === 0
      ? []
      : [
          {
            check: checkTool({
              ...fileInput,
              named,
              tool,
            }),
            tool,
          },
        ];
  });
  const missing = checks.flatMap(({ check, tool }) =>
    check.missing.map((short) => `${tag(tool)}${short}`),
  );
  const stray = checks.flatMap(({ check, tool }) =>
    check.stray.map((short) => `${tag(tool)}${short}`),
  );

  return {
    isNamed: checks.length > 0,
    problems: [
      ...(missing.length === 0
        ? []
        : [
            {
              kind: WiringProblemKind.Lacks,
              parts: missing,
            } satisfies WiringProblem,
          ]),
      ...(stray.length === 0
        ? []
        : [
            {
              kind: WiringProblemKind.NamesBeyond,
              parts: stray,
            } satisfies WiringProblem,
          ]),
      ...checks.flatMap(({ check }) => check.problems),
    ],
  };
};

const fileWarningsOf = (
  input: WiringInput & {
    folder: string;
    path: string;
    serves: Service['serves'];
    unlisted: Set<string>;
  },
): readonly ProjectWarning[] => {
  const { context, folder, path, unlisted } = input;
  const checked = checkFile(input);

  if (!checked.isNamed) {
    return [];
  }

  const isUnlisted = !(context.unitAt.has(folder) || unlisted.has(folder));

  unlisted.add(folder);

  return [
    ...(isUnlisted
      ? [
          {
            code: WarningCode.Unlisted,
            message: `${folder} keeps its own ${path} — declare the folder a member, with a constitution.yaml of its own`,
          },
        ]
      : []),
    ...(checked.problems.length === 0
      ? []
      : [
          {
            code: WarningCode.Wiring,
            message: `${fileOf(input)} ${WiringProblem.textOf(checked.problems)}${RATIFY}`,
          },
        ]),
  ];
};

/** The warnings of a project's wiring, in the order the files and the units are found. */
const checkWiringOf = (input: WiringInput): readonly ProjectWarning[] => {
  const { context } = input;
  const service = serveOf(input);
  const unlisted = new Set<string>();

  return [
    ...service.warnings,
    ...context.parts.paths.flatMap((path) =>
      WiringContext.foldersAt(context, path).flatMap((folder) =>
        fileWarningsOf({
          ...input,
          folder,
          path,
          serves: service.serves,
          unlisted,
        }),
      ),
    ),
  ];
};

export { checkWiringOf };
