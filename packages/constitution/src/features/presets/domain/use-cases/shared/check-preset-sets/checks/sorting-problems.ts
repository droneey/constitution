import type { ConfigurationFormat } from '../../../../contracts';
import type { PresetsProblem, PresetValue } from '../../../../entities';
import { PresetEntry, PresetsCode, Setting, ValueKind } from '../../../../entities';
import { TargetKind } from '../../../../value-objects';

interface SortingInput {
  readonly entry: PresetEntry;
  readonly formats: ConfigurationFormat;
}

// The key paths of the maps a value marks sorted, from its file's top.
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

/** A map an entry marks sorted in a file whose writer keeps no order of its keys holds nowhere. */
const sortingProblems = (input: SortingInput): readonly PresetsProblem[] => {
  const { entry } = input;

  if (entry.kind !== TargetKind.File || input.formats.canSortKeys(entry)) {
    return [];
  }

  return sortedPathsOf(entry.value, []).map((keyPath) => ({
    code: PresetsCode.SortedInUnsortableFile,
    details: {
      ...PresetEntry.namedOf(entry),
      file: entry.writtenPath,
      setting: Setting.pathTextOf(keyPath),
    },
  }));
};

export { sortingProblems };
