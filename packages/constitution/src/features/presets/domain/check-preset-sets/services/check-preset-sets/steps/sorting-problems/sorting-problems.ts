import { PresetEntry } from '../../../../../preset-entry/entities';
import type { PresetValue } from '../../../../../setting/entities';
import { Setting, ValueKind } from '../../../../../setting/entities';
import type { PresetsProblem } from '../../../../../shared/entities';
import { PresetsCode } from '../../../../../shared/entities';
import { TargetKind } from '../../../../../shared/value-objects';

interface SortingInput {
  readonly entry: PresetEntry;
  readonly sortable: ReadonlySet<PresetEntry>;
}

const sortedPathsOf = (
  given: PresetValue,
  keyPath: readonly string[],
): readonly (readonly string[])[] =>
  given.kind === ValueKind.Map
    ? [
        ...(given.isSorted
          ? [
              keyPath,
            ]
          : []),
        ...given.pairs.flatMap((pair) =>
          sortedPathsOf(pair.value, [
            ...keyPath,
            pair.key,
          ]),
        ),
      ]
    : [];

const sortingProblems = (input: SortingInput): readonly PresetsProblem[] => {
  const { entry } = input;

  if (entry.kind !== TargetKind.File || input.sortable.has(entry)) {
    return [];
  }

  return sortedPathsOf(entry.value, []).map((keyPath) => ({
    code: PresetsCode.SortedInUnsortableFile,
    details: {
      ...PresetEntry.namedOf(entry),
      file: entry.writtenPath,
      settingPath: Setting.pathTextOf(keyPath),
    },
  }));
};

export { sortingProblems };
