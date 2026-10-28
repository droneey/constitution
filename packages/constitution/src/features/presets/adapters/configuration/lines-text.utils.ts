import type { ConfigurationWrite } from '../../domain/contracts';
import type { BlockMarks, Setting } from '../../domain/entities';
import { BlockMarks as Marks, Setting as Settings } from '../../domain/entities';
import { NEWLINE } from './text.constants';

/** The lines each block gives, under a comment naming it, and every name such a comment holds. */
interface LinesLayout {
  readonly groups: ReadonlyMap<string, readonly string[]>;
  readonly names: readonly string[];
}

/** How a file of lines writes a comment, and so the comment naming a block. */
interface LineComments {
  readonly mark: string;
  readonly pattern: RegExp;
}

const LEADING_BLANKS = /^\n+/;
const TRAILING_NEWLINE = /\n$/;

const plainComments: LineComments = {
  mark: '# ',
  pattern: /^\s*[#;]/,
};

// A source file's lines are code, whose comments it writes as its language does.
const codeComments: LineComments = {
  mark: '// ',
  pattern: /^\s*\/\//,
};

/** Blank lines and comments are no items. */
const readWith =
  (comments: LineComments) =>
  (text: string): Setting =>
    text
      .split(NEWLINE)
      .map((line) => line.trim())
      .filter((line) => line !== '' && !comments.pattern.test(line));

const isBlank = (line: string | undefined): boolean => line?.trim() === '';

// A line is an item at the file's top: its group is the block that marks it.
const layoutOf = (input: { marks: BlockMarks; wanted: readonly string[] }): LinesLayout => {
  const marked = input.wanted.flatMap((line) => {
    const block = Marks.blockAt(input.marks, [
      {
        item: line,
      },
    ]);

    return block === undefined
      ? []
      : [
          {
            block,
            line,
          },
        ];
  });

  return {
    groups: new Map(
      [
        ...Map.groupBy(marked, ({ block }) => block),
      ].map(([block, given]) => [
        block,
        given.map(({ line }) => line),
      ]),
    ),
    names: input.marks.blocks,
  };
};

const linesOf = (layout: LinesLayout): ReadonlySet<string> =>
  new Set(
    [
      ...layout.groups.values(),
    ].flat(),
  );

// Our lines and our groups' names go, and a blank that only parted them goes with them.
const ownLinesOf = (input: {
  comments: LineComments;
  layout: LinesLayout;
  lines: readonly string[];
  wanted: readonly string[];
}): readonly string[] => {
  const ours = linesOf(input.layout);
  const names = new Set(input.layout.names.map((name) => `${input.comments.mark}${name}`));
  const own: string[] = [];
  // Stryker disable next-line BooleanLiteral: the blanks that open the file go in any case
  let isParted = false;

  for (const line of input.lines) {
    const trimmed = line.trim();
    const isOwn =
      trimmed === '' || input.comments.pattern.test(line)
        ? !names.has(trimmed)
        : !ours.has(trimmed) && input.wanted.includes(trimmed);

    if (!isOwn) {
      isParted = true;
    } else if (!(isBlank(line) && isParted && isBlank(own.at(-1)))) {
      own.push(line);
      isParted &&= isBlank(line);
    }
  }

  while (isBlank(own.at(-1))) {
    own.pop();
  }

  return own;
};

const groupedText = (input: {
  comments: LineComments;
  layout: LinesLayout;
  lines: readonly string[];
  wanted: readonly string[];
}): string => {
  const present = new Set(input.lines.map((line) => line.trim()));
  const ours = linesOf(input.layout);
  const own = [
    ...ownLinesOf(input),
    ...input.wanted.filter((line) => !(ours.has(line) || present.has(line))),
  ];

  return [
    own,
    ...[
      ...input.layout.groups,
    ].map(([name, lines]) => [
      `${input.comments.mark}${name}`,
      ...lines,
    ]),
  ]
    .map((block) => block.join(NEWLINE))
    .join(`${NEWLINE}${NEWLINE}`);
};

/** Blanks and comments stay; a file left with no line is empty. */
const writeWith =
  (comments: LineComments) =>
  (input: ConfigurationWrite): string => {
    const wanted = (Settings.isList(input.settings) ? input.settings : []).map(String);
    const lines = input.text.replace(TRAILING_NEWLINE, '').split(NEWLINE);
    const body = groupedText({
      comments,
      layout: layoutOf({
        marks: input.marks,
        wanted,
      }),
      lines,
      wanted,
    }).replace(LEADING_BLANKS, '');

    return body === '' ? '' : `${body}${NEWLINE}`;
  };

const readLines = readWith(plainComments);
const writeLines = writeWith(plainComments);
const readCodeLines = readWith(codeComments);
const writeCodeLines = writeWith(codeComments);

export { readCodeLines, readLines, writeCodeLines, writeLines };
