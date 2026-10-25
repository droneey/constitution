import { Placeholder } from '#/kernel/constants';
import type { ProjectWarning } from '#/kernel/entities';
import { ProjectUnit, WarningKind } from '#/kernel/entities';

import type { ConfigurationParser, Setting } from '../../../../../contracts';
import type { Skip } from '../../../../../entities';
import { WiringContext } from '../../../../../entities';
import type { WiringReads } from '../../../shared/wiring';
import { holdsBlock, isBeneath } from '../../../shared/wiring';

type Table = Readonly<Record<string, Setting>>;

// A step down to the list a template skips through: a key of a table, or the entry of a list whose
// plain settings are the template's.
enum StepKind {
  Key = 'key',
  Entry = 'entry',
}

type Step =
  | {
      readonly key: string;
      readonly kind: StepKind.Key;
    }
  | {
      readonly kind: StepKind.Entry;
      readonly plain: readonly (readonly [
        string,
        Setting,
      ])[];
    };

// Where a template's <unit folders> stands: the steps down to its list, and the text around it in its
// entry.
interface Place {
  readonly after: string;
  readonly before: string;
  readonly steps: readonly Step[];
}

const isTable = (setting: Setting | undefined): setting is Table =>
  typeof setting === 'object' && !Array.isArray(setting);

// The entries of a list of folders: a list's texts, or a text's lines.
const entriesOf = (setting: Setting | undefined): readonly string[] =>
  (typeof setting === 'string'
    ? setting.split('\n')
    : [
        setting,
      ].flat()
  ).filter((entry) => typeof entry === 'string');

// The texts, numbers and truth values of a table, which find its like in the root's list.
const plainOf = (
  table: Table,
): readonly (readonly [
  string,
  Setting,
])[] =>
  Object.entries(table).filter(
    ([, setting]) =>
      typeof setting !== 'object' && !String(setting).includes(Placeholder.UnitFolders),
  );

// The settings below one: a list's tables, each found by its plain settings, or a table's keys.
const belowOf = (
  setting: Setting | undefined,
): readonly (readonly [
  Step,
  Setting,
])[] => {
  if (Array.isArray(setting)) {
    // Stryker disable next-line MethodExpression: a list's texts were read as its entries above, so what is no table holds no placeholder below
    return setting.filter(isTable).map((table) => [
      {
        kind: StepKind.Entry,
        plain: plainOf(table),
      },
      table,
    ]);
  }

  return isTable(setting)
    ? Object.entries(setting).map(([key, below]) => [
        {
          key,
          kind: StepKind.Key,
        },
        below,
      ])
    : [];
};

const placeIn = (input: {
  setting: Setting | undefined;
  steps: readonly Step[];
}): Place | undefined => {
  const { setting, steps } = input;
  const entry = entriesOf(setting).find((text) => text.includes(Placeholder.UnitFolders));

  if (entry !== undefined) {
    const at = entry.indexOf(Placeholder.UnitFolders);

    return {
      after: entry.slice(at + Placeholder.UnitFolders.length),
      before: entry.slice(0, at),
      steps,
    };
  }

  return belowOf(setting)
    .map(([step, below]) =>
      placeIn({
        setting: below,
        steps: [
          ...steps,
          step,
        ],
      }),
    )
    .find((place) => place !== undefined);
};

const stepFrom = (input: { setting: Setting | undefined; step: Step }): Setting | undefined => {
  const { setting, step } = input;

  if (step.kind === StepKind.Key) {
    return isTable(setting) ? setting[step.key] : undefined;
  }

  return Array.isArray(setting)
    ? setting
        .filter(isTable)
        .find((table) => step.plain.every(([key, plain]) => table[key] === plain))
    : undefined;
};

// The folders the root's file of a skip lists where its template writes <unit folders>, none when
// the file does not parse; undefined when the template's settings hold no such list.
const skippedOf = (input: {
  parser: ConfigurationParser;
  reads: WiringReads;
  skip: Skip;
}): readonly string[] | undefined => {
  const { parser, reads, skip } = input;
  const place = placeIn({
    setting: parser.parse({
      path: skip.template.path,
      text: reads.partText(skip.template),
    }),
    steps: [],
  });

  if (place === undefined) {
    return undefined;
  }

  const { after, before } = place;
  const listed = place.steps.reduce<Setting | undefined>(
    (setting, step) =>
      stepFrom({
        setting,
        step,
      }),
    parser.parse({
      path: skip.path,
      text: reads.content(skip.path),
    }),
  );

  return entriesOf(listed)
    .filter(
      (entry) =>
        entry.length > before.length + after.length &&
        entry.startsWith(before) &&
        entry.endsWith(after),
    )
    .map((entry) => entry.slice(before.length, entry.length - after.length));
};

// Each folder the root's run of a tool skips holds a member of the workspace, and each member lies
// in one: the root runs the tool on its own files alone, and each member on its own.
const unitSkipsOf = (input: {
  context: WiringContext;
  parser: ConfigurationParser;
  reads: WiringReads;
}): readonly ProjectWarning[] => {
  const { context } = input;
  const members = context.resolution.units
    .filter((unit) => !ProjectUnit.isRepository(unit))
    .map((unit) => unit.path);

  return context.parts.skips
    .filter(
      (skip) =>
        holdsBlock(context.rootBlocks, skip.tool) &&
        WiringContext.hasFolder(context, {
          folder: '',
          path: skip.path,
        }),
    )
    .flatMap((skip) => {
      const skipped = skippedOf({
        ...input,
        skip,
      });

      if (skipped === undefined) {
        return [];
      }

      return [
        ...skipped
          .filter(
            (folder) =>
              !members.some((member) =>
                isBeneath({
                  folder,
                  path: member,
                }),
              ),
          )
          .map(
            (folder): ProjectWarning => ({
              details: {
                folder,
                path: skip.path,
              },
              kind: WarningKind.SkipOfNoMember,
            }),
          ),
        ...members
          .filter(
            (member) =>
              !skipped.some((folder) =>
                isBeneath({
                  folder,
                  path: member,
                }),
              ),
          )
          .map(
            (member): ProjectWarning => ({
              details: {
                member,
                path: skip.path,
                tool: skip.tool,
              },
              kind: WarningKind.MemberNotSkipped,
            }),
          ),
      ];
    });
};

export { unitSkipsOf };
