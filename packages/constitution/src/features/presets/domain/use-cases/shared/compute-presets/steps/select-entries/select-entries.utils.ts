import type { Axis } from '#/kernel/constants';
import type { BlockModel, ModelRule } from '#/kernel/entities';
import { ProjectUnit, Term } from '#/kernel/entities';
import { normalizePath } from '#/kernel/utils';
import type { RuleSlug } from '#/kernel/value-objects';
import { PackPath, SourceKind, UnitPath } from '#/kernel/value-objects';

import { EVERY } from '../../../../../constants';
import { PresetEntry } from '../../../../../entities';
import { Fact, FactKind, TargetFile } from '../../../../../value-objects';

interface Candidate {
  readonly entries: readonly PresetEntry[];
  /** its path from the repository */
  readonly file: string;
  readonly unit: ProjectUnit;
}

interface InForce {
  readonly axes: ReadonlySet<Axis>;
  readonly blocks: ReadonlySet<string>;
  readonly languages: ReadonlySet<string>;
  readonly lowered: ReadonlySet<RuleSlug>;
}

const inForceOf = (unit: ProjectUnit): InForce => ({
  axes: new Set(unit.axes),
  blocks: new Set<string>(unit.blocks),
  languages: new Set<string>(unit.languages),
  lowered: unit.loweredRules,
});

// A reader only the repository's unit follows is served by its file alone, over the blocks,
// languages and axes of every unit (ADR-0218); the rules it lowers are the repository's own.
const inForceForAll = (input: {
  lowered: ReadonlySet<RuleSlug>;
  units: readonly ProjectUnit[];
}): InForce => ({
  axes: new Set(input.units.flatMap((unit) => unit.axes)),
  blocks: new Set<string>(
    input.units.flatMap((unit) => [
      ...unit.blocks,
    ]),
  ),
  languages: new Set<string>(
    input.units.flatMap((unit) => [
      ...unit.languages,
    ]),
  ),
  lowered: input.lowered,
});

const isRuleInForce = (input: {
  entry: PresetEntry;
  inForce: InForce;
  rules: ReadonlyMap<string, ModelRule>;
}): boolean => {
  const { entry, inForce } = input;
  const rule = input.rules.get(entry.rule);

  // any lowering drops the rule's entries
  return (
    entry.rule === EVERY ||
    (rule !== undefined &&
      (rule.seam === undefined || inForce.blocks.has(rule.seam)) &&
      !inForce.lowered.has(rule.slug))
  );
};

const isTaken = (input: {
  entry: PresetEntry;
  inForce: InForce;
  rules: ReadonlyMap<string, ModelRule>;
}): boolean => {
  const { entry, inForce } = input;
  const { path } = entry.set;

  return (
    inForce.blocks.has(path.reader) &&
    inForce.axes.has(path.axis) &&
    path.withs.every((block) => inForce.blocks.has(block)) &&
    inForce.blocks.has(entry.block) &&
    (entry.language === EVERY || inForce.languages.has(entry.language)) &&
    isRuleInForce(input)
  );
};

const listsSource = (unit: ProjectUnit, entry: PresetEntry): boolean => {
  const { source } = entry.set;

  return (
    source.kind === SourceKind.Release ||
    unit.packs.some((pack) => PackPath.equals(pack, source.pack))
  );
};

// An entry's file from its unit's folder, its roles written as their terms are; undefined when it
// names a role no term defines, which its own finding reports.
const fileOf = (input: {
  entry: PresetEntry;
  model: BlockModel;
  unit: ProjectUnit;
}): string | undefined => {
  if (TargetFile.isRun(input.entry.file)) {
    return UnitPath.pathOf(input.unit.path, TargetFile.runPath);
  }

  const path = Fact.resolvedIn({
    text: input.entry.file.path,
    valueOf: (fact) => {
      const term =
        fact.kind === FactKind.Role
          ? PresetEntry.roleOf({
              entry: input.entry,
              id: fact.role,
              model: input.model,
            })
          : undefined;

      return term === undefined ? undefined : Term.roleNameOf(term);
    },
  });

  return path === undefined ? undefined : normalizePath(UnitPath.pathOf(input.unit.path, path));
};

interface SelectEntriesInput {
  /** in the order they merge in */
  readonly entries: readonly PresetEntry[];
  readonly model: BlockModel;
  readonly units: readonly ProjectUnit[];
}

interface TakeContext {
  readonly forAll: InForce;
  readonly model: BlockModel;
  readonly rules: ReadonlyMap<string, ModelRule>;
  /** the readers only the repository's unit follows */
  readonly shared: ReadonlySet<string>;
}

const takenBy = (
  input: TakeContext & {
    entries: readonly PresetEntry[];
    unit: ProjectUnit;
  },
): readonly Candidate[] => {
  const { unit } = input;
  const own = inForceOf(unit);

  return input.entries.flatMap((entry) => {
    const isShared = input.shared.has(entry.set.path.reader);
    const isServed = !isShared || ProjectUnit.isRepository(unit);
    const file =
      isServed &&
      listsSource(unit, entry) &&
      isTaken({
        entry,
        inForce: isShared ? input.forAll : own,
        rules: input.rules,
      })
        ? fileOf({
            entry,
            model: input.model,
            unit,
          })
        : undefined;

    return file === undefined
      ? []
      : [
          {
            entries: [
              entry,
            ],
            file,
            unit,
          },
        ];
  });
};

/**
 * An entry is taken where its reader, blocks, language and rule are in force in the unit; a file
 * two units write is the first one's.
 */
const selectEntries = (input: SelectEntriesInput): readonly Candidate[] => {
  const { model, units } = input;
  const repository = units.find(ProjectUnit.isRepository);
  const memberBlocks = new Set<string>(
    units
      .filter((unit) => !ProjectUnit.isRepository(unit))
      .flatMap((unit) => [
        ...unit.blocks,
      ]),
  );
  const context: TakeContext = {
    forAll: inForceForAll({
      lowered: repository?.loweredRules ?? new Set(),
      units,
    }),
    model,
    rules: new Map<string, ModelRule>(
      model.rules.map((rule) => [
        rule.slug,
        rule,
      ]),
    ),
    shared: new Set<string>(
      [
        // Stryker disable next-line ArrayDeclaration: with no repository's unit no entry is served as a shared reader's, whatever the set holds
        ...(repository?.blocks ?? []),
      ].filter((block) => !memberBlocks.has(block)),
    ),
  };
  const candidates = new Map<string, Candidate>();

  for (const taken of units.flatMap((unit) =>
    takenBy({
      ...context,
      entries: input.entries,
      unit,
    }),
  )) {
    const candidate = candidates.get(taken.file) ?? {
      ...taken,
      entries: [],
    };

    candidates.set(taken.file, {
      ...candidate,
      entries: [
        ...candidate.entries,
        ...taken.entries,
      ],
    });
  }

  return [
    ...candidates.values(),
  ];
};

export type { Candidate, SelectEntriesInput };
export { selectEntries };
