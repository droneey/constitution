import type { PresetsFinding } from '../../../../../entities';
import { MergedFile, PresetEntry, PresetValue } from '../../../../../entities';
import { EntryTarget } from '../../../../../value-objects';

/** Every entry is taken at once, so no unit, whatever blocks it lists, takes two that clash. */
const mergeEveryEntry = (entries: readonly PresetEntry[]): readonly PresetsFinding[] => {
  const byTarget = Map.groupBy(entries, (entry) => EntryTarget.textOf(entry));

  return [
    ...byTarget,
  ].flatMap(([target, written]) =>
    written.every((entry) => PresetValue.isInsertOnly(entry.value))
      ? []
      : MergedFile.merge(
          written.map((entry) => PresetEntry.contributionOf(entry, entry.value)),
        ).problems.map((problem) => ({
          ...problem,
          path: target,
        })),
  );
};

export { mergeEveryEntry };
