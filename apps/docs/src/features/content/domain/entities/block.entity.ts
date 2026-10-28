import type { ChapterListGaps } from '../errors';
import { SourceError, SourceFailure } from '../errors';

/** the axes a block's rules sit on, in their reading order */
enum Axis {
  Foundation = 'foundation',
  Architecture = 'architecture',
  Workflow = 'workflow',
}

/** the layers of blocks, each by its folder under the blocks folder and on the site, in their reading order */
enum BlockLayer {
  Core = 'core',
  Domain = 'domains',
  Platform = 'contexts/platforms',
  Language = 'contexts/languages',
  Implementation = 'implementations',
}

interface Block {
  readonly extends?: string;
  readonly id: string;
}

const axes: readonly string[] = Object.values(Axis);

const ABSTRACT_MARK = '_';

const isAxis = (segment: string): segment is Axis => axes.includes(segment);

const groupOf = (block: Block): string => {
  const groupId = block.extends ?? block.id;

  return groupId.startsWith(ABSTRACT_MARK) ? groupId.slice(ABSTRACT_MARK.length) : groupId;
};

/** below every character an id holds */
const KEY_SEPARATOR = '\u0000';

/**
 * An abstract block sits right above the blocks that extend it. The keys sort by code point, as the
 * hook sorts the blocks, so `_` puts the abstract block first in its group.
 */
const readingOrderOf = (blocks: readonly Block[]): readonly string[] =>
  blocks
    .map((block) => `${groupOf(block)}${KEY_SEPARATOR}${block.id}`)
    .toSorted()
    .map((key) => key.slice(key.indexOf(KEY_SEPARATOR) + KEY_SEPARATOR.length));

interface ChapterListInput {
  readonly chapters: readonly string[];
  readonly listed: readonly string[];
}

/** @throws {@link SourceError} when the list leaves out, repeats or invents a chapter */
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
  isAxis,
  listedChaptersOf,
  readingOrderOf,
} as const;

export { Axis, Block, BlockLayer };
