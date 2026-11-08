import { PATH_SEPARATOR } from '../../shared/constants';
import type { ChapterListGaps } from '../../source/errors';
import { SourceError, SourceFailure } from '../../source/errors';

enum Axis {
  Foundation = 'foundation',
  Architecture = 'architecture',
  Workflow = 'workflow',
}

enum BlockLayer {
  Core = 'core',
  Domain = 'domains',
  Platform = 'contexts/platforms',
  Language = 'contexts/languages',
  Implementation = 'implementations',
}

enum BlockFormat {
  Legacy = 'legacy',
  Nested = 'nested',
}

interface Block {
  readonly extends?: string;
  readonly id: string;
}

const axes: readonly Axis[] = Object.values(Axis);

const AXIS_MARK = '@';

const ABSTRACT_MARK = '_';

const nestedFolderOf = (axis: Axis): string => `${AXIS_MARK}${axis}`;

const axisOfFolder = (folderName: string | undefined): Axis | undefined =>
  axes.find((axis) => folderName === nestedFolderOf(axis) || folderName === axis);

const axisFoldersAmong = (names: readonly string[]): readonly string[] =>
  axes.flatMap((axis) => names.filter((name) => axisOfFolder(name) === axis));

const formatOf = (paths: readonly string[]): BlockFormat =>
  paths.some((path) =>
    path.split(PATH_SEPARATOR).some((segment) => axes.map(nestedFolderOf).includes(segment)),
  )
    ? BlockFormat.Nested
    : BlockFormat.Legacy;

const groupOf = (block: Block): string => {
  const groupId = block.extends ?? block.id;

  return groupId.startsWith(ABSTRACT_MARK) ? groupId.slice(ABSTRACT_MARK.length) : groupId;
};

// Why: it sorts below every character an id holds, so a group's blocks stay together.
const KEY_SEPARATOR = '\u0000';

// Why: the keys sort by code point, as the hook sorts the blocks, so `_` puts the abstract block
// first in its group, right above the blocks that extend it.
const readingOrderOf = (blocks: readonly Block[]): readonly string[] =>
  blocks
    .map((block) => `${groupOf(block)}${KEY_SEPARATOR}${block.id}`)
    .toSorted()
    .map((key) => key.slice(key.indexOf(KEY_SEPARATOR) + KEY_SEPARATOR.length));

interface ChapterListInput {
  readonly chapters: readonly string[];
  readonly listed: readonly string[];
}

/** @throws {SourceError} when the list leaves out, repeats or invents a chapter */
const listedChaptersOf = (input: ChapterListInput): readonly string[] => {
  const gaps: ChapterListGaps = {
    missing: input.chapters.filter((chapter) => !input.listed.includes(chapter)),
    repeated: [
      ...new Set(input.listed.filter((entry, index) => input.listed.indexOf(entry) !== index)),
    ],
    unknown: input.listed.filter((entry) => !input.chapters.includes(entry)),
  };

  if (gaps.missing.length > 0 || gaps.repeated.length > 0 || gaps.unknown.length > 0) {
    throw new SourceError({
      code: SourceFailure.ChapterListMismatch,
      details: gaps,
    });
  }

  return input.listed;
};

const Block = {
  axisFoldersAmong,
  axisOfFolder,
  formatOf,
  listedChaptersOf,
  readingOrderOf,
} as const;

export { Axis, Block, BlockFormat, BlockLayer };
