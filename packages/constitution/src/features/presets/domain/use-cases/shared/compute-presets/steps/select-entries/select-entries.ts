import type { BlockModel, ModelRule } from '#/kernel/entities';
import { ProjectUnit } from '#/kernel/entities';
import type { BlockId, RepositoryRelativePath, RuleSlug } from '#/kernel/value-objects';
import { configFilePath, PackPath, SourceKind, UnitPath } from '#/kernel/value-objects';

import type { EntryAsked } from '../../../../../entities';
import { InForce, PresetEntry } from '../../../../../entities';
import type { TargetFile, TargetRun } from '../../../../../value-objects';
import { EntryTarget, TargetKind } from '../../../../../value-objects';

interface FileCandidate {
  readonly droppedByOverrideOrAxis: readonly PresetEntry[];
  readonly entries: readonly (PresetEntry & TargetFile)[];
  readonly filePath: RepositoryRelativePath;
  readonly kind: TargetKind.File;
  readonly unit: ProjectUnit;
}

interface RunCandidate {
  readonly droppedByOverrideOrAxis: readonly PresetEntry[];
  readonly entries: readonly (PresetEntry & TargetRun)[];
  readonly kind: TargetKind.Run;
  readonly unit: ProjectUnit;
}

type Candidate = FileCandidate | RunCandidate;

type EntryFile = Omit<FileCandidate, 'droppedByOverrideOrAxis'>;

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

const fileCandidatesOf = (input: {
  entry: PresetEntry & TargetFile;
  model: BlockModel;
  unit: ProjectUnit;
}): readonly EntryFile[] => {
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

const entryFilesOf = (input: {
  entry: PresetEntry;
  model: BlockModel;
  unit: ProjectUnit;
}): readonly EntryFile[] => {
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
  readonly entries: readonly PresetEntry[];
  readonly model: BlockModel;
  readonly units: readonly ProjectUnit[];
}

interface TakeContext {
  readonly forAll: InForce;
  readonly model: BlockModel;
  readonly rules: ReadonlyMap<RuleSlug, ModelRule>;
  readonly shared: ReadonlySet<BlockId>;
}

interface UnitTaken {
  readonly droppedFiles: readonly EntryFile[];
  readonly files: readonly EntryFile[];
  readonly runs: readonly RunCandidate[];
}

const runEntriesOf = (entries: readonly PresetEntry[]): readonly (PresetEntry & TargetRun)[] =>
  entries.filter((entry) => entry.kind === TargetKind.Run);

const takenBy = (
  input: TakeContext & {
    entries: readonly PresetEntry[];
    unit: ProjectUnit;
  },
): UnitTaken => {
  const { unit } = input;
  const own = InForce.ofUnit(unit);

  const servedWhere = (
    isInForce: (inForce: InForce, given: EntryAsked) => boolean,
  ): readonly PresetEntry[] =>
    input.entries.filter((entry) => {
      const isShared = input.shared.has(entry.set.placeInPresets.reader);
      const isServed = !isShared || ProjectUnit.isRepository(unit);

      return (
        isServed &&
        listsSource(unit, entry) &&
        isInForce(isShared ? input.forAll : own, {
          entry,
          rules: input.rules,
        })
      );
    });

  const filesOf = (entries: readonly PresetEntry[]): readonly EntryFile[] =>
    entries.flatMap((entry) =>
      entryFilesOf({
        entry,
        model: input.model,
        unit,
      }),
    );

  const taken = servedWhere(InForce.takes);
  const dropped = servedWhere(InForce.isDroppedByOverrideOrAxis);
  const runEntries = runEntriesOf(taken);

  return {
    droppedFiles: filesOf(dropped),
    files: filesOf(taken),
    runs:
      // Stryker disable next-line ConditionalExpression: a run of no entry resolves to no candidate, which the resolve leaves out
      runEntries.length === 0
        ? []
        : [
            {
              droppedByOverrideOrAxis: runEntriesOf(dropped),
              entries: runEntries,
              kind: TargetKind.Run,
              unit,
            },
          ],
  };
};

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
  const droppedFiles = Map.groupBy(
    taken.flatMap((unitTaken) => unitTaken.droppedFiles),
    (file) => file.filePath,
  );

  return [
    ...files.values().flatMap((writers) =>
      writers.slice(0, 1).map((first) => ({
        ...first,
        droppedByOverrideOrAxis: (droppedFiles.get(first.filePath) ?? []).flatMap(
          (file) => file.entries,
        ),
        entries: writers.flatMap((file) => file.entries),
      })),
    ),
    ...taken.flatMap((unitTaken) => unitTaken.runs),
  ];
};

export type { Candidate, SelectEntriesInput };
export { candidatePathOf, selectEntries };
