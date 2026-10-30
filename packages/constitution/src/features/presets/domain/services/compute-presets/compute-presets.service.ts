import type { BlockModel, ProjectUnit } from '#/kernel/entities';
import { compareText, normalizePath } from '#/kernel/utils';
import type { BlockId, RepositoryRelativePath } from '#/kernel/value-objects';
import { UnitRelativePath } from '#/kernel/value-objects';

import type { Candidate, PresetsPlan } from '../../entities';
import { PresetEntry, PresetsFinding } from '../../entities';
import { EntryTarget, TargetKind } from '../../value-objects';
import { mergeEntries } from './steps/merge-entries';
import { resolveFacts } from './steps/resolve-facts';
import { selectEntries } from './steps/select-entries';
import { splitRuns } from './steps/split-runs';

interface PresetsSelected {
  readonly candidates: readonly Candidate[];
  readonly entries: readonly PresetEntry[];
}

interface PresetsPlanInput extends PresetsSelected {
  readonly constitutionPaths: ReadonlyMap<RepositoryRelativePath, string>;
  readonly findings: readonly PresetsFinding[];
  readonly model: BlockModel;
  readonly units: readonly ProjectUnit[];
}

interface Written {
  readonly block: BlockId;
  readonly pathInUnit: UnitRelativePath;
}

const writtenOf = (input: { entry: PresetEntry; model: BlockModel }): readonly Written[] => {
  const { entry } = input;

  switch (entry.kind) {
    case TargetKind.File: {
      const writtenPath = PresetEntry.writtenPathOf({
        entry,
        model: input.model,
      });

      return writtenPath === undefined || !EntryTarget.staysInItsUnit(entry)
        ? []
        : PresetEntry.blocksCommentsNameOf(entry).map((block) => ({
            block,
            pathInUnit: UnitRelativePath.create(normalizePath(writtenPath)),
          }));
    }
    case TargetKind.Run:
      return [];
    // Stryker disable next-line ConditionalExpression: no kind reaches the default, which only the compiler reads
    default:
      return entry satisfies never;
  }
};

const blockIdsOf = (input: {
  entries: readonly PresetEntry[];
  model: BlockModel;
}): PresetsPlan['blockIds'] => {
  const written = input.entries.flatMap((entry) =>
    writtenOf({
      entry,
      model: input.model,
    }),
  );

  return new Map(
    [
      ...Map.groupBy(written, ({ pathInUnit }) => pathInUnit),
    ].map(([pathInUnit, writers]) => [
      pathInUnit,
      [
        ...new Set(writers.map(({ block }) => block)),
      ],
    ]),
  );
};

interface PresetsSelectedInput {
  readonly entries: readonly PresetEntry[];
  readonly model: BlockModel;
  readonly units: readonly ProjectUnit[];
}

const presetsSelectedOf = (input: PresetsSelectedInput): PresetsSelected => {
  const entries = input.entries.toSorted(PresetEntry.orderOf(input.model));

  return {
    candidates: selectEntries({
      ...input,
      entries,
    }),
    entries,
  };
};

const presetsPlanOf = (input: PresetsPlanInput): PresetsPlan => {
  const { candidates, entries, model, units } = input;
  const resolved = resolveFacts({
    candidates,
    constitutionPaths: input.constitutionPaths,
    model,
    units,
  });
  const merged = mergeEntries({
    resolved: resolved.candidates,
  });
  const split = splitRuns({
    candidates,
    entries,
    merged: merged.candidates,
    units,
  });

  return {
    blockIds: blockIdsOf({
      entries,
      model,
    }),
    files: split.files.toSorted((left, right) => compareText(left.filePath, right.filePath)),
    runs: split.runs,
    findings: PresetsFinding.eachOnce([
      ...input.findings,
      ...resolved.findings,
      ...merged.findings,
      ...split.findings,
    ]),
  };
};

export type { PresetsPlanInput, PresetsSelected, PresetsSelectedInput };
export { presetsPlanOf, presetsSelectedOf };
