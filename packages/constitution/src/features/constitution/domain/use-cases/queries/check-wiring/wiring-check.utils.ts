import type { ProjectUnit, ProjectWarning } from '../../../entities';
import { WarningCode } from '../../../entities';
import { namedOf } from './named.utils';
import { appendTo, keyOf, Takes } from './parts.utils';
import { chainProblemsOf, copyProblemsOf } from './problems.utils';
import type { WiringContext } from './wiring-context.utils';
import {
  expectedOf,
  factOf,
  fileOf,
  isBeneath,
  isLowered,
  ownerOf,
  shortOf,
  unitNameOf,
} from './wiring-context.utils';

const SHOWN = 3;
const RATIFY = ' — run /constitution:ratify';

// Which units each file serves for a tool, and the tools a unit needs that no file wires.
interface Service {
  readonly serves: ReadonlyMap<string, readonly ProjectUnit[]>;
  readonly warnings: readonly ProjectWarning[];
}

const toolsAt = (input: { context: WiringContext; path: string }): readonly string[] => [
  ...(input.context.parts.toolsAt.get(input.path) ?? new Set()),
];

const foldersAt = (input: { context: WiringContext; path: string }): readonly string[] => [
  ...(input.context.folders.get(input.path) ?? new Set()),
];

// Whether a file of the unit's own folders below names the tool's parts; the repository's root
// needs no file of a tool its units configure below it.
const isWiredBelow = (input: {
  context: WiringContext;
  path: string;
  tool: string;
  unit: ProjectUnit;
}): boolean =>
  foldersAt(input).some(
    (folder) =>
      !(input.context.unitAt.has(folder) && input.unit.scope > 0) &&
      isBeneath({
        folder: input.unit.path,
        path: folder,
      }) &&
      namedOf({
        isCodeOnly: false,
        naming: input.context.naming,
        text: input.context.content(
          fileOf({
            folder,
            path: input.path,
          }),
        ),
        tool: input.tool,
      }).length > 0,
  );

interface ServiceDraft {
  readonly needs: Set<string>;
  readonly serves: Map<string, ProjectUnit[]>;
  readonly wired: Set<string>;
}

// A tool a unit takes, at one of its templates' paths: the file that serves it there, if any.
const serveTool = (input: {
  context: WiringContext;
  draft: ServiceDraft;
  path: string;
  tool: string;
  unit: ProjectUnit;
}): void => {
  const { context, draft, path, tool, unit } = input;
  const key = keyOf(String(unit.scope), tool);

  if (
    draft.wired.has(key) ||
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

  draft.needs.add(key);

  const folder = factOf(input);

  if (folder === undefined) {
    if (isWiredBelow(input)) {
      draft.wired.add(key);
    }

    return;
  }

  appendTo({
    item: unit,
    key: keyOf(
      fileOf({
        folder,
        path,
      }),
      tool,
    ),
    map: draft.serves,
  });
  draft.wired.add(key);
};

// A tool a unit needs is wired nowhere when no file wires it for the unit, nor for the repository
// that takes it too.
const nowhereOf = (input: {
  context: WiringContext;
  draft: ServiceDraft;
}): readonly ProjectWarning[] => {
  const { context, draft } = input;

  return context.resolution.units.flatMap((unit) =>
    context.blocks
      .filter(
        (tool) =>
          draft.needs.has(keyOf(String(unit.scope), tool)) &&
          !draft.wired.has(keyOf(String(unit.scope), tool)) &&
          !draft.wired.has(keyOf('0', tool)),
      )
      .map((tool) => ({
        code: WarningCode.Wiring,
        message: `${tool} is wired nowhere for ${unitNameOf(unit)}${RATIFY}`,
      })),
  );
};

// For each unit and active tool, the nearest file at or above it that names the tool's parts, a
// file of the unit's own folders below, or the root's when the unit inherits the tool (the root
// wires only the tools it takes); a tool no file names for a unit is wired nowhere.
const serveOf = (context: WiringContext): Service => {
  const draft: ServiceDraft = {
    needs: new Set(),
    serves: new Map(),
    wired: new Set(),
  };

  for (const unit of context.resolution.units.filter((candidate) => !isLowered(candidate))) {
    for (const path of context.parts.paths) {
      for (const tool of toolsAt({
        context,
        path,
      })) {
        serveTool({
          context,
          draft,
          path,
          tool,
          unit,
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

const listOf = (input: { count: number; shown: readonly string[] }): string =>
  `${input.shown.join(', ')}${input.count > SHOWN ? ` and ${input.count - SHOWN} more` : ''}`;

interface FileCheck {
  readonly isNamed: boolean;
  readonly problems: string;
}

interface ToolCheck {
  readonly missing: readonly string[];
  readonly problems: string;
  readonly stray: readonly string[];
}

interface FileInput {
  readonly context: WiringContext;
  readonly file: string;
  readonly folder: string;
  readonly owner: ProjectUnit;
  readonly path: string;
  readonly serves: ReadonlyMap<string, readonly ProjectUnit[]>;
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
  const served = input.serves.get(keyOf(input.file, input.tool)) ?? [];
  const isOwnerAdded = !(
    context.unitAt.has(input.folder) ||
    isLowered(owner) ||
    served.includes(owner)
  );

  return isOwnerAdded
    ? [
        owner,
        ...served,
      ]
    : served;
};

// What a file lacks of a tool's parts, names beyond them, and gets wrong in its copies and chain.
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
      problems: '',
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
  const shorts = expected.map(shortOf);
  const takes = context.parts.takes.get(keyOf(path, tool));
  const lines = text.split('\n');
  const copies =
    takes === Takes.Copies
      ? copyProblemsOf({
          context,
          expected: shorts,
          lines,
          tool,
        })
      : '';
  const chains =
    takes === Takes.Chains
      ? chainProblemsOf({
          context,
          entries: expected,
          lines,
          naming: context.naming,
          tool,
        })
      : '';

  return {
    missing: shorts.filter((short) => !input.named.includes(short)),
    problems: `${copies}${chains}`,
    stray: namedOf({
      isCodeOnly: true,
      naming: context.naming,
      text,
      tool,
    }).filter((short) => !shorts.includes(short)),
  };
};

const listedOf = (input: { label: string; shown: readonly string[] }): string =>
  input.shown.length === 0
    ? ''
    : `; ${input.label} ${listOf({
        count: input.shown.length,
        shown: input.shown.slice(0, SHOWN),
      })}`;

// What a file at a template's path lacks, names beyond what it takes, and gets wrong in its copies
// and chains, for every tool whose template writes it; a tool is tagged when several write it.
const checkFile = (input: {
  context: WiringContext;
  folder: string;
  path: string;
  serves: ReadonlyMap<string, readonly ProjectUnit[]>;
}): FileCheck => {
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
    text: context.content(file),
  };
  const tools = toolsAt({
    context,
    path,
  });
  const tag = (tool: string): string => (tools.length > 1 ? `${tool}:` : '');
  const checks = tools.flatMap((tool) => {
    const named = namedOf({
      isCodeOnly: false,
      naming: context.naming,
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
  const lacks = listedOf({
    label: 'lacks',
    shown: missing,
  });
  const names =
    stray.length === 0
      ? ''
      : `${listedOf({
          label: 'names',
          shown: stray,
        })}, which it does not take`;

  return {
    isNamed: checks.length > 0,
    problems: `${lacks}${names}${checks.map(({ check }) => check.problems).join('')}`,
  };
};

// The warnings of one file: that it lies in no listed package, then what its wiring lacks.
const fileWarningsOf = (input: {
  context: WiringContext;
  folder: string;
  path: string;
  serves: ReadonlyMap<string, readonly ProjectUnit[]>;
  unlisted: Set<string>;
}): readonly ProjectWarning[] => {
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
            message: `${folder} keeps its own ${path} — list it under packages: in constitution.yaml`,
          },
        ]
      : []),
    ...(checked.problems === ''
      ? []
      : [
          {
            code: WarningCode.Wiring,
            message: `${fileOf(input)} ${checked.problems.slice(2)}${RATIFY}`,
          },
        ]),
  ];
};

// The warnings of a project's wiring, in the order the files and the units are found.
const checkWiringOf = (context: WiringContext): readonly ProjectWarning[] => {
  const service = serveOf(context);
  const unlisted = new Set<string>();

  return [
    ...service.warnings,
    ...context.parts.paths.flatMap((path) =>
      foldersAt({
        context,
        path,
      }).flatMap((folder) =>
        fileWarningsOf({
          context,
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
