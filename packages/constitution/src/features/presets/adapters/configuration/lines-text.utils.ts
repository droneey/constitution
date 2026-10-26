import type { LinesLayout, Setting } from '../../domain/entities';
import { Setting as Settings } from '../../domain/entities';
import type { SettingsText } from './settings-text.types';

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

// Our lines and our groups' names go, and a blank that only parted them goes with them.
const ownLinesOf = (input: {
  layout: LinesLayout;
  lines: readonly string[];
  wanted: readonly string[];
}): readonly string[] => {
  const ours = new Set(input.layout.groups.flatMap((group) => group.lines));
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
  const ours = new Set(input.layout.groups.flatMap((group) => group.lines));
  const own = [
    ...ownLinesOf(input),
    ...input.wanted.filter((line) => !(ours.has(line) || present.has(line))),
  ];

  return [
    own,
    ...input.layout.groups.map((group) => [
      `${NAME_MARK}${group.name}`,
      ...group.lines,
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
    input.layout === undefined
      ? [
          ...lines.filter(
            (line) => line.trim() === '' || isComment(line) || wanted.includes(line.trim()),
          ),
          ...wanted.filter((line) => !present.has(line)),
        ].join(NEWLINE)
      : groupedText({
          layout: input.layout,
          lines,
          wanted,
        })
  ).replace(LEADING_BLANKS, '');

  return body === '' ? '' : `${body}${NEWLINE}`;
};

export { readLines, writeLines };
