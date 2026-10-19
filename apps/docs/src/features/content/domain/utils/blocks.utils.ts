interface LayerBlock {
  /** the abstract block it extends, if any */
  base: string | undefined;
  id: string;
}

interface ChapterListGaps {
  /** chapters on disk the list leaves out */
  missing: readonly string[];
  /** entries listed more than once */
  repeated: readonly string[];
  /** entries that name no chapter on disk */
  unknown: readonly string[];
}

/** the mark an abstract block's id opens with */
const ABSTRACT = '_';

/** where a block stands among its layer's: by its name, or by its base's when it extends one */
const groupOf = (block: LayerBlock): string => {
  const name = block.base ?? block.id;

  return name.startsWith(ABSTRACT) ? name.slice(ABSTRACT.length) : name;
};

/** what parts a block's group from its id in its sort key: below every character a name holds */
const KEY_SEPARATOR = '\u0000';

/**
 * A layer's blocks by their names, an abstract block right above the blocks that extend it. The keys
 * sort by code point, as the hook sorts the blocks, so `_` puts the abstract block first in its group.
 */
const readingOrderOf = (blocks: readonly LayerBlock[]): readonly string[] =>
  blocks
    .map((block) => `${groupOf(block)}${KEY_SEPARATOR}${block.id}`)
    .toSorted()
    .map((key) => key.slice(key.indexOf(KEY_SEPARATOR) + KEY_SEPARATOR.length));

/** how a list of chapters differs from the chapters on disk */
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
