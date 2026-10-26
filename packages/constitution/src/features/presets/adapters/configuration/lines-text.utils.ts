import type { BlockMarks, Setting } from '../../domain/entities';
import { BlockMarks as Marks, Setting as Settings } from '../../domain/entities';
import type { SettingsText } from './settings-text.types';

/** The lines each block gives, under a comment naming it, and every name such a comment holds. */
interface LinesLayout {
  readonly groups: ReadonlyMap<string, readonly string[]>;
  readonly names: readonly string[];
}

const NEWLINE = '\n';
const COMMENT = /^\s*[#;]/;
const LEADING_BLANKS = /^\n+/;
const TRAILING_NEWLINE = /\n$/;
const NAME_MARK = '# ';

const isComment = (line: string): boolean => COMMENT.test(line);

/** Blank lines and comments are no items. */
const readLines = (text: string): Setting =>
  text
    .split(NEWLINE)
    .map((line) => line.trim())
    .filter((line) => line !== '' && !isComment(line));

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
  layout: LinesLayout;
  lines: readonly string[];
  wanted: readonly string[];
}): readonly string[] => {
  const ours = linesOf(input.layout);
  const names = new Set(input.layout.names.map((name) => `${NAME_MARK}${name}`));
  const own: string[] = [];
  // Stryker disable next-line BooleanLiteral: the blanks that open the file go in any case
  let isParted = false;

  for (const line of input.lines) {
    const trimmed = line.trim();
    const isOwn =
      trimmed === '' || isComment(line)
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
      `${NAME_MARK}${name}`,
      ...lines,
    ]),
  ]
    .map((block) => block.join(NEWLINE))
    .join(`${NEWLINE}${NEWLINE}`);
};

/** Blanks and comments stay; a file left with no line is empty. */
const writeLines = (input: SettingsText): string => {
  const wanted = (Settings.isList(input.settings) ? input.settings : []).map(String);
  const lines = input.text.replace(TRAILING_NEWLINE, '').split(NEWLINE);
  const present = new Set(lines.map((line) => line.trim()));
  const body = (
    input.marks === undefined
      ? [
          ...lines.filter(
            (line) => line.trim() === '' || isComment(line) || wanted.includes(line.trim()),
          ),
          ...wanted.filter((line) => !present.has(line)),
        ].join(NEWLINE)
      : groupedText({
          layout: layoutOf({
            marks: input.marks,
            wanted,
          }),
          lines,
          wanted,
        })
  ).replace(LEADING_BLANKS, '');

  return body === '' ? '' : `${body}${NEWLINE}`;
};

export { readLines, writeLines };
