const AXIS_FOLDERS: readonly string[] = [
  'foundation',
  'architecture',
  'workflow',
] as const;

interface Block {
  readonly extends: string | undefined;
  readonly id: string;
}

interface ChapterListGaps {
  readonly missing: readonly string[];
  readonly repeated: readonly string[];
  readonly unknown: readonly string[];
}

const ABSTRACT_MARK = '_';

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

const chapterListGapsOf = (input: {
  chapters: readonly string[];
  listed: readonly string[];
}): ChapterListGaps => ({
  missing: input.chapters.filter((chapter) => !input.listed.includes(chapter)),
  repeated: [
    ...new Set(input.listed.filter((entry, index) => input.listed.indexOf(entry) !== index)),
  ],
  unknown: input.listed.filter((entry) => !input.chapters.includes(entry)),
});

export type { Block, ChapterListGaps };
export { AXIS_FOLDERS, chapterListGapsOf, readingOrderOf };
