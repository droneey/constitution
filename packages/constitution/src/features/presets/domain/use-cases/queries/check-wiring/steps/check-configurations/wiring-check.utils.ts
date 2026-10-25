import type { ProjectWarning, WiringProblem } from '#/kernel/entities';
import { FileReadStatus, ProjectUnit, WarningKind, WiringProblemKind } from '#/kernel/entities';
import { PartAddress } from '#/kernel/value-objects';

import { Parts, Takes, WiringContext } from '../../../../../entities';
import { expectedOf, fileOf, namedOf, ownerOf, wiringRule } from '../../../shared/wiring';
import { chainProblemsOf, copyProblemsOf } from './problems.utils';
import type { Service, WiringInput } from './wiring-service.utils';
import { serveOf } from './wiring-service.utils';

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
  const shorts = expected.map(({ address }) => PartAddress.shortOf(address));
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
    text: string;
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

interface CheckedFile {
  readonly checked: FileCheck;
  readonly folder: string;
  readonly path: string;
}

const fileWarningsOf = (
  input: CheckedFile & {
    isUnlisted: boolean;
  },
): readonly ProjectWarning[] => [
  ...(input.isUnlisted
    ? [
        {
          details: {
            folder: input.folder,
            path: input.path,
          },
          kind: WarningKind.FolderKeepsConfig,
        } satisfies ProjectWarning,
      ]
    : []),
  ...(input.checked.problems.length === 0
    ? []
    : [
        {
          details: {
            file: fileOf(input),
            problems: input.checked.problems,
          },
          kind: WarningKind.FileMiswired,
        } satisfies ProjectWarning,
      ]),
];

const unreadableOf = (file: string): ProjectWarning => ({
  details: {
    file,
  },
  kind: WarningKind.WiringFileUnreadable,
});

/**
 * The warnings of a project's wiring, in the order the files and the units are found; a folder that
 * is no unit's is named once, at the first file there that names parts.
 */
const checkWiringOf = (input: WiringInput): readonly ProjectWarning[] => {
  const { context } = input;
  const service = serveOf(input);
  const files = context.parts.paths.flatMap((path) =>
    WiringContext.foldersAt(context, path).map((folder) => ({
      folder,
      path,
      read: input.reads.content(
        fileOf({
          folder,
          path,
        }),
      ),
    })),
  );
  const named = files
    .flatMap(({ folder, path, read }) =>
      read.status === FileReadStatus.Read
        ? [
            {
              checked: checkFile({
                ...input,
                folder,
                path,
                serves: service.serves,
                text: read.text,
              }),
              folder,
              path,
            },
          ]
        : [],
    )
    .filter((file) => file.checked.isNamed);
  const firstIn = new Map<string, CheckedFile>();

  for (const file of named) {
    if (!firstIn.has(file.folder)) {
      firstIn.set(file.folder, file);
    }
  }

  return [
    ...service.warnings,
    ...context.parts.unreadable.map(unreadableOf),
    ...files
      .filter(({ read }) => read.status === FileReadStatus.Unreadable)
      .map((file) => unreadableOf(fileOf(file))),
    ...named.flatMap((file) =>
      fileWarningsOf({
        ...file,
        isUnlisted: !context.unitAt.has(file.folder) && firstIn.get(file.folder) === file,
      }),
    ),
  ];
};

export { checkWiringOf };
