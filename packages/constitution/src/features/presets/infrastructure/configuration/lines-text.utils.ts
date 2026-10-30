import type { BlockMarks, ConfigurationWrite, Setting } from '../../domain/entities';
import { BlockMarks as Marks, Setting as Settings } from '../../domain/entities';
import { NEWLINE } from './text.constants';

interface LinesLayout {
  readonly groups: ReadonlyMap<string, readonly string[]>;
  readonly names: readonly string[];
}

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

const codeComments: LineComments = {
  mark: '// ',
  pattern: /^\s*\/\//,
};

const readWith =
  (comments: LineComments) =>
  (text: string): Setting =>
    text
      .split(NEWLINE)
      .map((line) => line.trim())
      .filter((line) => line !== '' && !comments.pattern.test(line));

const isBlank = (line: string | undefined): boolean => line?.trim() === '';

const groupedByMarkingBlock = (input: {
  marks: BlockMarks;
  wanted: readonly string[];
}): LinesLayout => {
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

const ourLinesOf = (layout: LinesLayout): ReadonlySet<string> =>
  new Set(
    [
      ...layout.groups.values(),
    ].flat(),
  );

const projectLinesOf = (input: {
  comments: LineComments;
  layout: LinesLayout;
  lines: readonly string[];
  wanted: readonly string[];
}): readonly string[] => {
  const ours = ourLinesOf(input.layout);
  const names = new Set(input.layout.names.map((name) => `${input.comments.mark}${name}`));
  const kept: string[] = [];
  // Stryker disable next-line BooleanLiteral: the blanks that open the file go in any case
  let isParted = false;

  const isProjectLine = (line: string): boolean => {
    const trimmed = line.trim();

    return trimmed === '' || input.comments.pattern.test(line)
      ? !names.has(trimmed)
      : !ours.has(trimmed) && input.wanted.includes(trimmed);
  };

  for (const line of input.lines) {
    if (!isProjectLine(line)) {
      isParted = true;
    } else if (!(isBlank(line) && isParted && isBlank(kept.at(-1)))) {
      kept.push(line);
      isParted &&= isBlank(line);
    }
  }

  while (isBlank(kept.at(-1))) {
    kept.pop();
  }

  return kept;
};

const groupedText = (input: {
  comments: LineComments;
  layout: LinesLayout;
  lines: readonly string[];
  wanted: readonly string[];
}): string => {
  const present = new Set(input.lines.map((line) => line.trim()));
  const ours = ourLinesOf(input.layout);
  const own = [
    ...projectLinesOf(input),
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

const writeWith =
  (comments: LineComments) =>
  (input: ConfigurationWrite): string => {
    const wanted = (Settings.isList(input.settings) ? input.settings : []).map(String);
    const lines = input.text.replace(TRAILING_NEWLINE, '').split(NEWLINE);
    const body = groupedText({
      comments,
      layout: groupedByMarkingBlock({
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
