import type { FilePlan, PresetsFinding } from '../../../../../entities';
import { MergedFile, PresetValue } from '../../../../../entities';
import type { ResolvedFile } from '../resolve-facts';

interface FilesMerged {
  readonly files: readonly FilePlan[];
  readonly findings: readonly PresetsFinding[];
}

/**
 * Each file's contributions merged in their order; a file whose entries only insert into lists no
 * entry of it places is not written, as its lists' owner is not in force there.
 */
const mergeEntries = (resolved: readonly ResolvedFile[]): FilesMerged => {
  const files = resolved.flatMap((file) =>
    file.contributions.every((contribution) => PresetValue.isInsertOnly(contribution.value))
      ? []
      : [
          {
            entries: file.entries,
            file: file.file,
            merged: MergedFile.merge(file.contributions),
            unit: file.unit.path,
          },
        ],
  );

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

export type { FilesMerged };
export { mergeEntries };
