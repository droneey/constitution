interface LayerBlock {
  base: string | undefined;
  id: string;
}

interface ChapterListGaps {
  missing: readonly string[];
  repeated: readonly string[];
  unknown: readonly string[];
}

const ABSTRACT = '_';

const groupOf = (block: LayerBlock): string => {
  const name = block.base ?? block.id;

  return name.startsWith(ABSTRACT) ? name.slice(ABSTRACT.length) : name;
};

/** below every character a name holds */
const KEY_SEPARATOR = '\u0000';

/**
 * An abstract block sits right above the blocks that extend it. The keys sort by code point, as the
 * hook sorts the blocks, so `_` puts the abstract block first in its group.
 */
const readingOrderOf = (blocks: readonly LayerBlock[]): readonly string[] =>
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

export type { ChapterListGaps, LayerBlock };
export { chapterListGapsOf, readingOrderOf };
