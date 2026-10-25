/** the axes a block's rules sit on, in their reading order */
enum Axis {
  Foundation = 'foundation',
  Architecture = 'architecture',
  Workflow = 'workflow',
}

interface Block {
  readonly extends?: string;
  readonly id: string;
}

interface ChapterListGaps {
  readonly missing: readonly string[];
  readonly repeated: readonly string[];
  readonly unknown: readonly string[];
}

const axes: readonly string[] = Object.values(Axis);

const ABSTRACT_MARK = '_';

const isAxis = (segment: string): segment is Axis => axes.includes(segment);

const groupOf = (block: Block): string => {
  const name = block.extends ?? block.id;

  return name.startsWith(ABSTRACT_MARK) ? name.slice(ABSTRACT_MARK.length) : name;
};

/** below every character a name holds */
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

interface ChapterListGapsInput {
  readonly chapters: readonly string[];
  readonly listed: readonly string[];
}

const chapterListGapsOf = (input: ChapterListGapsInput): ChapterListGaps => ({
  missing: input.chapters.filter((chapter) => !input.listed.includes(chapter)),
  repeated: [
    ...new Set(input.listed.filter((entry, index) => input.listed.indexOf(entry) !== index)),
  ],
  unknown: input.listed.filter((entry) => !input.chapters.includes(entry)),
});

const Block = {
  chapterListGapsOf,
  isAxis,
  readingOrderOf,
} as const;

export type { ChapterListGaps };
export { Axis, Block };
