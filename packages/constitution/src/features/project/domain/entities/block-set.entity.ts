import type { Axis, Layer, Level } from '#/kernel/constants';
import type { FileReadStatus, Met, RoleTerm } from '#/kernel/entities';
import { compareText } from '#/kernel/utils';
import type {
  AbsolutePath,
  BlockId,
  BlockSource,
  Glob,
  PackPath,
  RuleSlug,
} from '#/kernel/value-objects';
import { BlockFilePlace } from '#/kernel/value-objects';

/** A chapter of a block, <axis>/<name>.md. */
interface ChapterPlace {
  readonly axis: Axis;
  readonly name: string;
}

/** A seam of a block, <axis>/with/<other>.md. */
interface SeamPlace {
  readonly axis: Axis;
  readonly other: BlockId;
}

/**
 * A block of the Constitution or of a pack as a project reads it, its chapters and seams in the
 * order the blocks are read; a card without front matter leaves its fields empty or absent.
 */
interface BlockSetBlock {
  readonly chapters: readonly ChapterPlace[];
  readonly extends?: BlockId;
  readonly governs: readonly Glob[];
  readonly id: BlockId;
  readonly isAbstract: boolean;
  readonly languages: readonly BlockId[];
  readonly layer: Layer;
  readonly requires: readonly BlockId[];
  readonly seams: readonly SeamPlace[];
  readonly source: BlockSource;
  readonly summary?: string;
}

interface BlockSetRule {
  readonly axis: Axis;
  readonly block: BlockId;
  readonly isLevelStated: boolean;
  readonly level: Level;
  readonly seam?: BlockId;
  readonly slug: RuleSlug;
  readonly tightens?: RuleSlug;
}

interface BlockSetAnswer {
  readonly block: BlockId;
  readonly met?: Met;
  readonly requirement: RuleSlug;
}

interface BlockSet {
  readonly answers: readonly BlockSetAnswer[];
  readonly blocks: readonly BlockSetBlock[];
  /** the folders and suffixes the blocks define, each by its first definition */
  readonly roles: readonly RoleTerm[];
  readonly rules: readonly BlockSetRule[];
}

/** A markdown file of a source, its path from the source's folder: blocks/domains/ui/ui.md. */
type SourceFile = {
  readonly path: string;
} & (
  | {
      readonly status: FileReadStatus.Read;
      readonly text: string;
    }
  | {
      readonly status: FileReadStatus.Unreadable;
    }
);

/**
 * The files of a source in the order a project reads them, the one the Constitution's check loads
 * its blocks in; a file in no block's folder comes last.
 */
const inReadOrder = (files: readonly SourceFile[]): readonly SourceFile[] =>
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

const SourceFile = {
  inReadOrder,
} as const;

/** Whether the blocks folder of a source can be listed: a pack's cannot until it is installed. */
enum SourceStatus {
  Listed = 'listed',
  Unlisted = 'unlisted',
}

type BlockSetSource = {
  /** the folder a warning names the source's files under */
  readonly shownFolderPath: AbsolutePath | PackPath;
  readonly source: BlockSource;
} & (
  | {
      readonly files: readonly SourceFile[];
      readonly status: SourceStatus.Listed;
    }
  | {
      readonly status: SourceStatus.Unlisted;
    }
);

export type {
  BlockSet,
  BlockSetAnswer,
  BlockSetBlock,
  BlockSetRule,
  BlockSetSource,
  ChapterPlace,
  SeamPlace,
};
export { SourceFile, SourceStatus };
