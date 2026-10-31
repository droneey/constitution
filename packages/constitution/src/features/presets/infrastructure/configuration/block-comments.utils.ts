import { isDeepEqual } from '#/kernel/utils';

import type {
  BlockMarks,
  ConfigurationWrite,
  HeldStep,
} from '../../domain/configuration-file/entities';
import { BlockMarks as Marks } from '../../domain/configuration-file/entities';
import { NEWLINE } from './text.constants';

interface Anchor {
  readonly keyPath: readonly HeldStep[];
  readonly line: number;
}

interface Commenting {
  readonly anchorsOf: (text: string) => readonly Anchor[];
  readonly linesInsideTextValuesOf: (text: string) => ReadonlySet<number>;
  readonly prefix: string;
}

interface AnchorAtInput {
  readonly keyPath: readonly HeldStep[];
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

const noLinesInsideTextValues = (): ReadonlySet<number> => new Set();

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

const continuesBlockRun = (input: {
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

const opensNestedValue = (line: string): boolean => {
  const text = line.trim();

  return text.startsWith('[') || OPENERS.some((opener) => text.endsWith(opener));
};

const blockNamingComment = (input: { block: string; prefix: string }): string =>
  `${input.prefix} ${input.block}`;

const withoutBlockComments = (input: {
  commenting: Commenting;
  marks: BlockMarks;
  text: string;
}): string => {
  const { commenting } = input;
  const linesInsideTextValues = commenting.linesInsideTextValuesOf(input.text);
  const own = new Set(
    input.marks.blocks.map((block) =>
      blockNamingComment({
        block,
        prefix: commenting.prefix,
      }),
    ),
  );

  return input.text
    .split(NEWLINE)
    .filter((line, at) => linesInsideTextValues.has(at) || !own.has(line.trim()))
    .join(NEWLINE);
};

const blockByFirstMarkedLine = (input: {
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
      !continuesBlockRun({
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

const blockCommentLines = (input: {
  block: string;
  line: string;
  previous: string | undefined;
  prefix: string;
}): readonly string[] => [
  ...(input.previous === undefined ||
  input.previous.trim() === '' ||
  opensNestedValue(input.previous)
    ? []
    : [
        '',
      ]),
  `${input.line.slice(0, input.line.length - input.line.trimStart().length)}${blockNamingComment({
    block: input.block,
    prefix: input.prefix,
  })}`,
];

const withBlockCommentsLaid = (input: {
  commenting: Commenting;
  marks: BlockMarks;
  text: string;
}): string => {
  const { commenting } = input;
  const lines = input.text.split(NEWLINE);
  const linesInsideTextValues = commenting.linesInsideTextValuesOf(input.text);

  const isComment = (at: number): boolean =>
    // Stryker disable next-line ConditionalExpression: a line before the start reads as "undefined", which is no comment, so the bound only states where the walk stops
    at >= 0 &&
    !linesInsideTextValues.has(at) &&
    String(lines[at]).trimStart().startsWith(commenting.prefix);

  const above = new Map<number, readonly string[]>();

  for (const [at, block] of blockByFirstMarkedLine(input)) {
    let start = at;

    while (isComment(start - 1)) {
      start -= 1;
    }

    above.set(
      start,
      blockCommentLines({
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

// Why: the writer would move the comments naming the blocks, so they are taken out before it writes
// and laid again on what it wrote; the file's own comments stay where the writer keeps them.
const withBlockComments =
  (input: BlockCommentsInput): ((written: ConfigurationWrite) => string) =>
  (written: ConfigurationWrite): string => {
    const { marks } = written;

    return withBlockCommentsLaid({
      commenting: input.commenting,
      marks,
      text: input.write({
        ...written,
        text: withoutBlockComments({
          commenting: input.commenting,
          marks,
          text: written.text,
        }),
      }),
    });
  };

export type { Anchor, Commenting };
export { anchorAt, lineAt, noLinesInsideTextValues, withBlockComments };
