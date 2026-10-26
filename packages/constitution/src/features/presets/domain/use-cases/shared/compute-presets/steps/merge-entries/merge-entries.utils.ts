import type { FilePlan, PresetEntry, PresetsFinding } from '../../../../../entities';
import { MergedFile, PresetValue } from '../../../../../entities';
import { joinWords } from '../join-words';
import { markBlocks } from '../mark-blocks';
import type { ResolvedFile } from '../resolve-facts';

interface FilesMerged {
  readonly files: readonly FilePlan[];
  readonly findings: readonly PresetsFinding[];
}

interface MergeEntriesInput {
  /** every entry the presets hold */
  readonly entries: readonly PresetEntry[];
  readonly resolved: readonly ResolvedFile[];
}

/**
 * A file whose entries only insert into lists no entry of it places is not written: its lists' owner
 * is not in force there.
 */
const mergeEntries = (input: MergeEntriesInput): FilesMerged => {
  const files = input.resolved.flatMap((file): readonly FilePlan[] => {
    if (file.contributions.every((contribution) => PresetValue.isInsertOnly(contribution.value))) {
      return [];
    }

    const written = MergedFile.merge(file.contributions);
    const merged =
      written.value === undefined
        ? written
        : {
            ...written,
            value: joinWords({
              contributions: file.contributions,
              merged: written.value,
            }),
          };
    const marks = markBlocks({
      contributions: file.contributions,
      entries: input.entries,
      merged: merged.value,
      written: file.entries,
    });

    const format = file.entries.find((entry) => entry.file.format !== undefined)?.file.format;

    return [
      {
        entries: file.entries,
        file: file.file,
        ...(format === undefined
          ? {}
          : {
              format,
            }),
        ...(marks === undefined
          ? {}
          : {
              marks,
            }),
        merged,
        unit: file.unit.path,
      },
    ];
  });

  return {
    files,
    findings: files.flatMap((file) =>
      file.merged.problems.map((problem) => ({
        ...problem,
        path: file.file,
      })),
    ),
  };
};

export type { FilesMerged, MergeEntriesInput };
export { mergeEntries };
