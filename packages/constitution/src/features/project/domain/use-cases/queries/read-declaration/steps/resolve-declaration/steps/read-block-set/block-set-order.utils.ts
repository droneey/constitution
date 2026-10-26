import { compareText } from '#/kernel/utils';
import { BlockFilePlace } from '#/kernel/value-objects';

/**
 * The files of a source in the order a project reads them, the one the Constitution's check loads
 * its blocks in; a file in no block's folder comes last.
 */
const inBlockSetOrder = <
  TFile extends {
    readonly path: string;
  },
>(
  files: readonly TFile[],
): readonly TFile[] =>
  files
    .map((file) => ({
      file,
      place: BlockFilePlace.parse(file.path),
    }))
    .toSorted((left, right) => {
      if (left.place === undefined || right.place === undefined) {
        return (
          Number(left.place === undefined) - Number(right.place === undefined) ||
          compareText(left.file.path, right.file.path)
        );
      }

      return BlockFilePlace.compare(left.place, right.place);
    })
    .map(({ file }) => file);

export { inBlockSetOrder };
