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

interface ChapterPlace {
  readonly axis: Axis;
  readonly name: string;
}

interface SeamPlace {
  readonly axis: Axis;
  readonly other: BlockId;
}

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
  readonly roles: readonly RoleTerm[];
  readonly rules: readonly BlockSetRule[];
}

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

enum SourceStatus {
  Listed = 'listed',
  Unlisted = 'unlisted',
}

type BlockSetSource = {
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
