import { Axis, ConfigKey, Layer, PATH_SEPARATOR, REQUIRED_CONFIG_KEYS } from '#/kernel/constants';
import type { ProjectWarning } from '#/kernel/entities';
import { WarningKind } from '#/kernel/entities';
import type { BlockId } from '#/kernel/value-objects';
import { configFilePath, coreBlockId, SourceKind, UnitPath } from '#/kernel/value-objects';

import type { ConfigItem, ProjectConfig, ResolvedUnits } from '../../../../../../../entities';
import {
  DeclaredUnit,
  LAYER_KEYS,
  layerOfKey,
  ProjectModel,
  ResolvedUnit,
} from '../../../../../../../entities';

const OPTIONAL_AXES = [
  Axis.Architecture,
  Axis.Workflow,
] as const;

const knownKeys: ReadonlySet<string> = new Set([
  ...REQUIRED_CONFIG_KEYS,
  ConfigKey.Name,
]);

const fileOf = (unit: DeclaredUnit): string => UnitPath.pathOf(unit.path, configFilePath);

const unitKeyWarningsOf = (unit: DeclaredUnit): readonly ProjectWarning[] => {
  const { config } = unit;
  const file = fileOf(unit);

  return [
    ...REQUIRED_CONFIG_KEYS.filter((key) => !config.keys.includes(key)).map(
      (key): ProjectWarning => ({
        details: {
          file,
          key,
        },
        kind: WarningKind.KeyMissing,
      }),
    ),
    ...config.keys
      .filter((key) => !knownKeys.has(key))
      .map(
        (key): ProjectWarning => ({
          details: {
            file,
            key,
          },
          kind: WarningKind.KeyUnknown,
        }),
      ),
    ...config.empties.map(
      (key): ProjectWarning => ({
        details: {
          file,
          key,
        },
        kind: WarningKind.KeyEmpty,
      }),
    ),
  ];
};

const keyWarningsOf = (config: ProjectConfig): readonly ProjectWarning[] =>
  config.units.flatMap(unitKeyWarningsOf);

const optionalAxes: ReadonlySet<string> = new Set(OPTIONAL_AXES);

const isOptionalAxis = (text: string): text is Axis => optionalAxes.has(text);

type Warned<TResult> = TResult & {
  readonly warnings: readonly ProjectWarning[];
};

type Declared = Warned<{
  readonly blocks: readonly BlockId[];
}>;

const refused = (warning: ProjectWarning): Declared => ({
  blocks: [],
  warnings: [
    warning,
  ],
});

const axesOf = (
  unit: DeclaredUnit,
): Warned<{
  readonly axes: ReadonlySet<Axis>;
}> => {
  const isListed =
    unit.config.keys.includes(ConfigKey.Axes) && !unit.config.empties.includes(ConfigKey.Axes);
  const listed = unit.config.items
    .filter((entry) => entry.key === ConfigKey.Axes)
    .map((entry) => entry.text);

  return {
    axes: new Set([
      Axis.Foundation,
      ...OPTIONAL_AXES.filter((axis) => !isListed || listed.includes(axis)),
    ]),
    warnings: listed.flatMap((text): readonly ProjectWarning[] => {
      if (text === Axis.Foundation) {
        return [
          {
            details: {
              file: fileOf(unit),
            },
            kind: WarningKind.FoundationListed,
          },
        ];
      }

      return isOptionalAxis(text)
        ? []
        : [
            {
              details: {
                axis: text,
              },
              kind: WarningKind.AxisUnknown,
            },
          ];
    }),
  };
};

const declaredOf = (input: {
  entry: ConfigItem;
  model: ProjectModel;
  unit: DeclaredUnit;
}): Declared => {
  const { entry, model, unit } = input;
  const name = entry.text;
  const block = ProjectModel.blockNamed(model, name);

  if (name.includes(PATH_SEPARATOR)) {
    return refused({
      details: {
        name,
      },
      kind: WarningKind.NameIsPath,
    });
  }

  if (block === undefined) {
    return refused({
      details: {
        name,
      },
      kind: WarningKind.NameUnknown,
    });
  }

  if (block.layer === Layer.Core) {
    return refused({
      details: {
        key: entry.key,
      },
      kind: WarningKind.CoreListed,
    });
  }

  if (block.isAbstract) {
    return refused({
      details: {
        heirs: ProjectModel.heirsOf(model, block.id),
        name,
      },
      kind: WarningKind.AbstractListed,
    });
  }

  if (block.source.kind === SourceKind.Pack && !DeclaredUnit.listsPack(unit, block.source.pack)) {
    return refused({
      details: {
        file: fileOf(unit),
        name,
        pack: block.source.pack,
      },
      kind: WarningKind.PackUnlisted,
    });
  }

  return {
    blocks: [
      block.id,
      ...ProjectModel.basesOf(model, block.id),
    ],
    warnings:
      block.layer === layerOfKey(entry.key)
        ? []
        : [
            {
              details: {
                key: entry.key,
                layer: block.layer,
                name,
                toKey: LAYER_KEYS[block.layer],
              },
              kind: WarningKind.BlockUnderWrongKey,
            },
          ],
  };
};

const isDeclared = (entry: ConfigItem): boolean =>
  entry.key !== ConfigKey.Axes && entry.key !== ConfigKey.Packs;

const blocksOf = (input: {
  model: ProjectModel;
  unit: DeclaredUnit;
}): Warned<{
  readonly blocks: ReadonlySet<BlockId>;
}> => {
  const declared = input.unit.config.items.filter(isDeclared).map((entry) =>
    declaredOf({
      ...input,
      entry,
    }),
  );

  return {
    blocks: new Set([
      ...(input.model.byId.has(coreBlockId)
        ? [
            coreBlockId,
          ]
        : []),
      ...declared.flatMap(({ blocks }) => blocks),
    ]),
    warnings: declared.flatMap(({ warnings }) => warnings),
  };
};

type UnitWarned = Warned<{
  readonly unit: ResolvedUnit;
}>;

const unitOf = (input: { model: ProjectModel; unit: DeclaredUnit }): UnitWarned => {
  const { unit } = input;
  const followed = axesOf(unit);
  const active = blocksOf(input);

  return {
    unit: ResolvedUnit.create({
      axes: followed.axes,
      blocks: active.blocks,
      name: unit.config.name,
      packs: DeclaredUnit.packsOf(unit),
      path: unit.path,
    }),
    warnings: [
      ...followed.warnings,
      ...active.warnings,
    ],
  };
};

interface ResolveUnitsInput {
  readonly config: ProjectConfig;
  readonly model: ProjectModel;
}

interface UnitsResolved {
  readonly units: ResolvedUnits;
  readonly warnings: readonly ProjectWarning[];
}

const resolveUnits = (input: ResolveUnitsInput): UnitsResolved => {
  const [repository, ...members] = input.config.units;

  const resolvedOf = (unit: DeclaredUnit): UnitWarned =>
    unitOf({
      model: input.model,
      unit,
    });

  const first = resolvedOf(repository);
  const rest = members.map(resolvedOf);

  return {
    units: [
      first.unit,
      ...rest.map(({ unit }) => unit),
    ],
    warnings: [
      ...keyWarningsOf(input.config),
      ...[
        first,
        ...rest,
      ].flatMap(({ warnings }) => warnings),
    ],
  };
};

export { resolveUnits };
