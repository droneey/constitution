import { isDeepEqual } from '#/kernel/utils';

import type { ConfigurationWrite } from '../../domain/contracts';
import type { BlockMarks, HeldStep } from '../../domain/entities';
import { BlockMarks as Marks } from '../../domain/entities';
import { NEWLINE } from './text.constants';

/** The line that begins a key or an item of the file, by the path to it from the file's top. */
interface Anchor {
  readonly keyPath: readonly HeldStep[];
  readonly line: number;
}

interface Commenting {
  /** the lines each key or item opens, in their order */
  readonly anchorsOf: (text: string) => readonly Anchor[];
  readonly prefix: string;
  /** the lines a text value spans, on which no comment stands */
  readonly textLinesOf: (text: string) => ReadonlySet<number>;
}

interface AnchorAtInput {
  readonly keyPath: readonly HeldStep[];
  /** what may stand before the key or the item on a line it opens */
  readonly lineStart: RegExp;
  readonly offset: number;
  readonly text: string;
}

interface BlockCommentsInput {
  readonly commenting: Commenting;
  readonly write: (written: ConfigurationWrite) => string;
}

interface Marked {
  readonly block: string;
  /** how many steps of the path lead to the key or item it marks */
  readonly depth: number;
}

interface Seen {
  readonly keyPath: readonly HeldStep[];
  readonly marked: Marked | undefined;
}

const OPENERS = [
  '{',
  '[',
  ':',
] as const;

const lineAt = (text: string, offset: number): number =>
  text.slice(0, offset).split(NEWLINE).length - 1;

/** None where something lineStart does not allow stands before the offset on its line. */
const anchorAt = (input: AnchorAtInput): readonly Anchor[] => {
  const before = input.text.slice(0, input.offset);

  return input.lineStart.test(before.slice(before.lastIndexOf(NEWLINE) + 1))
    ? [
        {
          line: lineAt(input.text, input.offset),
          keyPath: input.keyPath,
        },
      ]
    : [];
};

const noTextLines = (): ReadonlySet<number> => new Set();

const markedOf = (marks: BlockMarks, keyPath: readonly HeldStep[]): Marked | undefined => {
  for (let depth = 1; depth <= keyPath.length; depth += 1) {
    const block = Marks.blockAt(marks, keyPath.slice(0, depth));

    if (block !== undefined) {
      return {
        block,
        depth,
      };
    }
  }

  return undefined;
};

// A run goes on while the key or the item before is a sibling the same block gives.
const isRunOf = (input: {
  marked: Marked;
  keyPath: readonly HeldStep[];
  previous: Seen | undefined;
}): boolean => {
  const { marked, previous } = input;

  return (
    previous?.marked?.block === marked.block &&
    previous.marked.depth === marked.depth &&
    isDeepEqual(
      previous.keyPath.slice(0, marked.depth - 1),
      input.keyPath.slice(0, marked.depth - 1),
    )
  );
};

// A line that opens what follows it: a map, a list, or a table's or a section's header.
const isOpener = (line: string): boolean => {
  const text = line.trim();

  return text.startsWith('[') || OPENERS.some((opener) => text.endsWith(opener));
};

const ownComment = (input: { block: string; prefix: string }): string =>
  `${input.prefix} ${input.block}`;

const uncommented = (input: {
  commenting: Commenting;
  marks: BlockMarks;
  text: string;
}): string => {
  const { commenting } = input;
  const texts = commenting.textLinesOf(input.text);
  const own = new Set(
    input.marks.blocks.map((block) =>
      ownComment({
        block,
        prefix: commenting.prefix,
      }),
    ),
  );

  return input.text
    .split(NEWLINE)
    .filter((line, at) => texts.has(at) || !own.has(line.trim()))
    .join(NEWLINE);
};

// Of each run of keys or items one block gives in a map or a list, the first is marked.
const markedLines = (input: {
  commenting: Commenting;
  marks: BlockMarks;
  text: string;
}): ReadonlyMap<number, string> => {
  const above = new Map<number, string>();
  let previous: Seen | undefined;

  for (const anchor of input.commenting.anchorsOf(input.text)) {
    const marked = markedOf(input.marks, anchor.keyPath);

    if (
      marked !== undefined &&
      !isRunOf({
        marked,
        keyPath: anchor.keyPath,
        previous,
      })
    ) {
      above.set(anchor.line, marked.block);
    }

    previous = {
      marked,
      keyPath: anchor.keyPath,
    };
  }

  return above;
};

// A comment naming the block opens a paragraph of its own, above the comments of the project that
// stand right above what it names: a blank line before it, unless it opens the file or follows the
// line that opens what holds it.
const headerLines = (input: {
  block: string;
  line: string;
  previous: string | undefined;
  prefix: string;
}): readonly string[] => [
  ...(input.previous === undefined || input.previous.trim() === '' || isOpener(input.previous)
    ? []
    : [
        '',
      ]),
  `${input.line.slice(0, input.line.length - input.line.trimStart().length)}${ownComment({
    block: input.block,
    prefix: input.prefix,
  })}`,
];

const commented = (input: { commenting: Commenting; marks: BlockMarks; text: string }): string => {
  const { commenting } = input;
  const lines = input.text.split(NEWLINE);
  const texts = commenting.textLinesOf(input.text);

  const isComment = (at: number): boolean =>
    !texts.has(at) && String(lines[at]).trimStart().startsWith(commenting.prefix);

  const above = new Map<number, readonly string[]>();

  for (const [at, block] of markedLines(input)) {
    let start = at;

    while (isComment(start - 1)) {
      start -= 1;
    }

    above.set(
      start,
      headerLines({
        block,
        line: String(lines[at]),
        previous: lines[start - 1],
        prefix: commenting.prefix,
      }),
    );
  }

  return lines
    .flatMap((line, at) => [
      ...(above.get(at) ?? []),
      line,
    ])
    .join(NEWLINE);
};

/**
 * The format's writer, with the comments naming the blocks taken out of the text before it writes
 * and laid again on what it wrote; the file's own comments stay where the writer keeps them.
 */
const withBlockComments =
  (input: BlockCommentsInput): ((written: ConfigurationWrite) => string) =>
  (written: ConfigurationWrite): string => {
    const { marks } = written;

    return commented({
      commenting: input.commenting,
      marks,
      text: input.write({
        ...written,
        text: uncommented({
          commenting: input.commenting,
          marks,
          text: written.text,
        }),
      }),
    });
  };

export type { Anchor, Commenting };
export { anchorAt, lineAt, noTextLines, withBlockComments };
