import { Axis, CHECK_KEY, CONFIG_FILE, Layer, OPTIONAL_AXES } from '#/kernel/constants';
import { WarningCode, WarningKind } from '#/kernel/entities';
import type { BlockId } from '#/kernel/value-objects';
import { coreBlockId, SourceKind, UnitPath } from '#/kernel/value-objects';

import type { ConfigItem, ProjectConfig, ResolvedUnits } from '../../../../../../../entities';
import { DeclaredUnit, ProjectModel, ResolvedUnit } from '../../../../../../../entities';
import { keyOfLayer, layerOfKey } from '../../shared/layer-keys';
import type { WarningLog } from '../../shared/warning-log';

const KEYS: readonly string[] = [
  'axes',
  'domains',
  'platforms',
  'languages',
  'implementations',
  'packs',
  'check',
  'overrides',
] as const;
const AXES_KEY = 'axes';
const PACKS_KEY = 'packs';

const fileOf = (unit: DeclaredUnit): string => UnitPath.pathOf(unit.path, CONFIG_FILE);

// A member names no check: the repository's is the one check of the whole tree.
const keysOf = (unit: DeclaredUnit): readonly string[] =>
  UnitPath.isRepository(unit.path) ? KEYS : KEYS.filter((key) => key !== CHECK_KEY);

const warnOfUnitKeys = (input: { log: WarningLog; unit: DeclaredUnit }): void => {
  const { log, unit } = input;
  const { config } = unit;
  const file = fileOf(unit);
  const known = keysOf(unit);

  for (const key of known) {
    if (!config.keys.includes(key)) {
      log.add({
        code: WarningCode.Config,
        details: {
          file,
          key,
        },
        kind: WarningKind.KeyMissing,
      });
    }
  }

  for (const key of config.keys) {
    if (!known.includes(key)) {
      log.add({
        code: WarningCode.Config,
        details: {
          file,
          key,
        },
        kind: WarningKind.KeyUnknown,
      });
    }
  }

  for (const key of config.empties) {
    log.add({
      code: WarningCode.Config,
      details: {
        file,
        key,
      },
      kind: WarningKind.KeyEmpty,
    });
  }
};

const warnOfKeys = (input: { config: ProjectConfig; log: WarningLog }): void => {
  for (const unit of input.config.units) {
    warnOfUnitKeys({
      log: input.log,
      unit,
    });
  }
};

// The optional axes a unit's axes list picks, with a warning for any other name it gives.
const pickedAxesOf = (input: { log: WarningLog; unit: DeclaredUnit }): ReadonlySet<string> => {
  const { log, unit } = input;
  const picked = new Set<string>();

  for (const listed of unit.config.items.filter((entry) => entry.key === AXES_KEY)) {
    if (listed.text === Axis.Foundation) {
      log.add({
        code: WarningCode.Config,
        details: {
          file: fileOf(unit),
        },
        kind: WarningKind.FoundationListed,
      });
    } else if (OPTIONAL_AXES.find((axis) => axis === listed.text) === undefined) {
      log.add({
        code: WarningCode.Config,
        details: {
          axis: listed.text,
        },
        kind: WarningKind.AxisUnknown,
      });
    } else {
      picked.add(listed.text);
    }
  }

  return picked;
};

// foundation is always followed; axes lists the optional ones, and a unit without the key follows
// both.
const axesOf = (input: { log: WarningLog; unit: DeclaredUnit }): ReadonlySet<Axis> => {
  const { unit } = input;
  const isListed = unit.config.lists.includes(AXES_KEY) && !unit.config.empties.includes(AXES_KEY);
  const picked = pickedAxesOf(input);

  return new Set([
    Axis.Foundation,
    ...OPTIONAL_AXES.filter((axis) => !isListed || picked.has(axis)),
  ]);
};

// The blocks a name of a unit's list makes active, the bases of the block it names among them, or
// none with the warning that says why.
const declaredOf = (input: {
  entry: ConfigItem;
  log: WarningLog;
  model: ProjectModel;
  unit: DeclaredUnit;
}): readonly BlockId[] => {
  const { entry, log, model, unit } = input;
  const name = entry.text;
  const block = ProjectModel.blockNamed(model, name);

  if (name.includes('/')) {
    log.add({
      code: WarningCode.Unknown,
      details: {
        name,
      },
      kind: WarningKind.NameIsPath,
    });

    return [];
  }

  if (block === undefined) {
    log.add({
      code: WarningCode.Unknown,
      details: {
        name,
      },
      kind: WarningKind.NameUnknown,
    });

    return [];
  }

  if (block.layer === Layer.Core) {
    log.add({
      code: WarningCode.WrongKey,
      details: {
        key: entry.key,
      },
      kind: WarningKind.CoreListed,
    });

    return [];
  }

  if (block.isAbstract) {
    log.add({
      code: WarningCode.Abstract,
      details: {
        heirs: ProjectModel.heirsOf(model, block.id),
        name,
      },
      kind: WarningKind.AbstractListed,
    });

    return [];
  }

  if (block.source.kind === SourceKind.Pack && !DeclaredUnit.listsPack(unit, block.source.pack)) {
    log.add({
      code: WarningCode.Pack,
      details: {
        file: fileOf(unit),
        name,
        pack: block.source.pack,
      },
      kind: WarningKind.PackUnlisted,
    });

    return [];
  }

  if (block.layer !== layerOfKey(entry.key)) {
    log.add({
      code: WarningCode.WrongKey,
      details: {
        key: entry.key,
        layer: block.layer,
        name,
        toKey: keyOfLayer(block.layer),
      },
      kind: WarningKind.BlockUnderWrongKey,
    });
  }

  return [
    block.id,
    ...ProjectModel.basesOf(model, block.id),
  ];
};

const isDeclared = (entry: ConfigItem): boolean =>
  entry.key !== AXES_KEY && entry.key !== PACKS_KEY;

// A unit's blocks start from core, in the catalogue's order; then each block its unit lists joins
// them, with its bases.
const blocksOf = (input: {
  log: WarningLog;
  model: ProjectModel;
  unit: DeclaredUnit;
}): ReadonlySet<BlockId> =>
  new Set([
    ...(input.model.byId.has(coreBlockId)
      ? [
          coreBlockId,
        ]
      : []),
    ...input.unit.config.items.filter(isDeclared).flatMap((entry) =>
      declaredOf({
        ...input,
        entry,
      }),
    ),
  ]);

// A resolved unit for each declared one, the repository's first: each holds its own axes and blocks
// alone. Every unit's axes are read before any unit's blocks.
const resolveUnits = (input: {
  config: ProjectConfig;
  log: WarningLog;
  model: ProjectModel;
}): ResolvedUnits => {
  const [repository, ...members] = input.config.units;

  const withAxes = (
    unit: DeclaredUnit,
  ): {
    readonly axes: ReadonlySet<Axis>;
    readonly unit: DeclaredUnit;
  } => ({
    axes: axesOf({
      log: input.log,
      unit,
    }),
    unit,
  });

  const repositoryAxes = withAxes(repository);
  const memberAxes = members.map(withAxes);

  const resolve = (declared: { axes: ReadonlySet<Axis>; unit: DeclaredUnit }): ResolvedUnit =>
    ResolvedUnit.create({
      axes: declared.axes,
      blocks: blocksOf({
        log: input.log,
        model: input.model,
        unit: declared.unit,
      }),
      path: declared.unit.path,
    });

  return [
    resolve(repositoryAxes),
    ...memberAxes.map(resolve),
  ];
};

export { resolveUnits, warnOfKeys };
