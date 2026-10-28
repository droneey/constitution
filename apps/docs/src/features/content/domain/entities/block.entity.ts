import type { ChapterListGaps } from '../errors';
import { SourceError, SourceFailure } from '../errors';

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
  isAxis,
  listedChaptersOf,
  readingOrderOf,
} as const;

export { Axis, Block, BlockLayer };
