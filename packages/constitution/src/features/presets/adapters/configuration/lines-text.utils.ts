import type { Setting } from '../../domain/entities';
import { Setting as Settings } from '../../domain/entities';
import type { SettingsText } from './settings-text.types';

const NEWLINE = '\n';
const COMMENT = /^\s*[#;]/;
const LEADING_BLANKS = /^\n+/;

const isComment = (line: string): boolean => COMMENT.test(line);

/** Blank lines and comments are no items. */
const readLines = (text: string): Setting =>
  text
    .split(NEWLINE)
    .map((line) => line.trim())
    .filter((line) => line !== '' && !isComment(line));

/** Blanks and comments stay; a file left with no line is empty. */
const writeLines = (input: SettingsText): string => {
  const wanted = (Settings.isList(input.settings) ? input.settings : []).map(String);
  const lines = input.text.replace(/\n$/, '').split(NEWLINE);
  const present = new Set(lines.map((line) => line.trim()));
  const kept = lines.filter(
    (line) => line.trim() === '' || isComment(line) || wanted.includes(line.trim()),
  );

  const body = [
    ...kept,
    ...wanted.filter((line) => !present.has(line)),
  ]
    .join(NEWLINE)
    .replace(LEADING_BLANKS, '');

  return body === '' ? '' : `${body}${NEWLINE}`;
};

export { readLines, writeLines };
