import type { BlockModel, ModelRule } from '#/kernel/entities';
import { ProjectUnit } from '#/kernel/entities';
import type { BlockId, RepositoryRelativePath, RuleSlug } from '#/kernel/value-objects';
import { configFilePath, PackPath, SourceKind, UnitPath } from '#/kernel/value-objects';

import { InForce, PresetEntry } from '../../../../../entities';
import type { TargetFile, TargetRun } from '../../../../../value-objects';
import { EntryTarget, TargetKind } from '../../../../../value-objects';

interface FileCandidate {
  readonly entries: readonly (PresetEntry & TargetFile)[];
  readonly filePath: RepositoryRelativePath;
  readonly kind: TargetKind.File;
  readonly unit: ProjectUnit;
}

interface RunCandidate {
  readonly entries: readonly (PresetEntry & TargetRun)[];
  readonly kind: TargetKind.Run;
  readonly unit: ProjectUnit;
}

/** The entries in force for one target: a file, held by the first unit that writes it, or a unit's run. */
type Candidate = FileCandidate | RunCandidate;

/**
 * The path a candidate's findings name, from whose folder its facts are read: its file's, or its
 * unit's constitution.yaml.
 */
const candidatePathOf = (candidate: Candidate): RepositoryRelativePath => {
  switch (candidate.kind) {
    case TargetKind.File:
      return candidate.filePath;
    case TargetKind.Run:
      return UnitPath.pathOf(candidate.unit.path, configFilePath);
    // Stryker disable next-line ConditionalExpression: no kind reaches the default, which only the compiler reads
    default:
      return candidate satisfies never;
  }
};

const listsSource = (unit: ProjectUnit, entry: PresetEntry): boolean => {
  const { source } = entry.set;

  return (
    source.kind === SourceKind.Release ||
    unit.packs.some((pack) => PackPath.equals(pack, source.pack))
  );
};

// An entry's file, its roles written as their terms are; none when it names a role no term
// defines or leaves its unit's folder, which its own finding reports.
const fileCandidatesOf = (input: {
  entry: PresetEntry & TargetFile;
  model: BlockModel;
  unit: ProjectUnit;
}): readonly FileCandidate[] => {
  const writtenPath = PresetEntry.writtenPathOf(input);

  return writtenPath === undefined || !EntryTarget.staysInItsUnit(input.entry)
    ? []
    : [
        {
          entries: [
            input.entry,
          ],
          filePath: UnitPath.resolve(input.unit.path, writtenPath),
          kind: TargetKind.File,
          unit: input.unit,
        },
      ];
};

// The files an entry writes; a run's entries make a candidate of their own.
const entryFilesOf = (input: {
  entry: PresetEntry;
  model: BlockModel;
  unit: ProjectUnit;
}): readonly FileCandidate[] => {
  const { entry } = input;

  switch (entry.kind) {
    case TargetKind.File:
      return fileCandidatesOf({
        ...input,
        entry,
      });
    case TargetKind.Run:
      return [];
    // Stryker disable next-line ConditionalExpression: no kind reaches the default, which only the compiler reads
    default:
      return entry satisfies never;
  }
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
  readonly rules: ReadonlyMap<RuleSlug, ModelRule>;
  /** the readers only the repository's unit follows */
  readonly shared: ReadonlySet<BlockId>;
}

interface UnitTaken {
  /** each of one entry */
  readonly files: readonly FileCandidate[];
  readonly runs: readonly RunCandidate[];
}

const takenBy = (
  input: TakeContext & {
    entries: readonly PresetEntry[];
    unit: ProjectUnit;
  },
): UnitTaken => {
  const { unit } = input;
  const own = InForce.ofUnit(unit);
  const taken = input.entries.filter((entry) => {
    const isShared = input.shared.has(entry.set.placeInPresets.reader);
    const isServed = !isShared || ProjectUnit.isRepository(unit);

    return (
      isServed &&
      listsSource(unit, entry) &&
      InForce.takes(isShared ? input.forAll : own, {
        entry,
        rules: input.rules,
      })
    );
  });

  const runEntries = taken.filter((entry) => entry.kind === TargetKind.Run);

  return {
    files: taken.flatMap((entry) =>
      entryFilesOf({
        entry,
        model: input.model,
        unit,
      }),
    ),
    runs:
      // Stryker disable next-line ConditionalExpression: a run of no entry resolves to no candidate, which the resolve leaves out
      runEntries.length === 0
        ? []
        : [
            {
              entries: runEntries,
              kind: TargetKind.Run,
              unit,
            },
          ],
  };
};

/** An entry is taken where its reader, blocks, language and rule are in force in the unit. */
const selectEntries = (input: SelectEntriesInput): readonly Candidate[] => {
  const { model, units } = input;
  const repository = units.find(ProjectUnit.isRepository);
  const memberBlocks = new Set(
    units
      .filter((unit) => !ProjectUnit.isRepository(unit))
      .flatMap((unit) => [
        ...unit.blocks,
      ]),
  );
  const context: TakeContext = {
    forAll: InForce.ofUnits({
      lowered: repository?.loweredRules ?? new Set(),
      units,
    }),
    model,
    rules: new Map<RuleSlug, ModelRule>(
      model.rules.map((rule) => [
        rule.slug,
        rule,
      ]),
    ),
    shared: new Set(
      [
        // Stryker disable next-line ArrayDeclaration: with no repository's unit no entry is served as a shared reader's, whatever the set holds
        ...(repository?.blocks ?? []),
      ].filter((block) => !memberBlocks.has(block)),
    ),
  };
  const taken = units.map((unit) =>
    takenBy({
      ...context,
      entries: input.entries,
      unit,
    }),
  );
  const files = Map.groupBy(
    taken.flatMap((unitTaken) => unitTaken.files),
    (file) => file.filePath,
  );

  return [
    // A file is held by the first unit that writes it, with the entries of every unit that does.
    ...files.values().flatMap((writers) =>
      writers.slice(0, 1).map((first) => ({
        ...first,
        entries: writers.flatMap((file) => file.entries),
      })),
    ),
    ...taken.flatMap((unitTaken) => unitTaken.runs),
  ];
};

export type { Candidate, SelectEntriesInput };
export { candidatePathOf, selectEntries };
