import type { PresetsFinding } from '../../../../../entities';
import { MergedFile, PresetEntry, PresetValue } from '../../../../../entities';

/**
 * What the entries of each file clash on when every one of them is taken at once, found from the
 * catalogues alone: whatever blocks a unit lists, no two entries it takes can clash.
 */
const mergeEveryEntry = (entries: readonly PresetEntry[]): readonly PresetsFinding[] => {
  const byFile = Map.groupBy(entries, (entry) => entry.file.path);

  return [
    ...byFile,
  ].flatMap(([file, written]) =>
    written.every((entry) => PresetValue.isInsertOnly(entry.value))
      ? []
      : MergedFile.merge(
          written.map((entry) => ({
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
