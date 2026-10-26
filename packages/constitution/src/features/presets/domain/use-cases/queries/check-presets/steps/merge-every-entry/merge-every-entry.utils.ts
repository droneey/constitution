import type { PresetsFinding } from '../../../../../entities';
import { MergedFile, PresetEntry, PresetValue } from '../../../../../entities';

/** Every entry is taken at once, so no unit, whatever blocks it lists, takes two that clash. */
const mergeEveryEntry = (entries: readonly PresetEntry[]): readonly PresetsFinding[] => {
  const byFile = Map.groupBy(entries, (entry) => entry.file.path);

  return [
    ...byFile,
  ].flatMap(([file, written]) =>
    written.every((entry) => PresetValue.isInsertOnly(entry.value))
      ? []
      : MergedFile.merge(
          written.map((entry) => ({
            block: PresetEntry.blockOf(entry),
            source: PresetEntry.sourceOf(entry),
            value: entry.value,
          })),
        ).problems.map((problem) => ({
          ...problem,
          path: file,
        })),
  );
};

export { mergeEveryEntry };
