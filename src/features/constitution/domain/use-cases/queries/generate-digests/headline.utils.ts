import { blankInlineCode } from '#/libs/markdown';

const WHITESPACE = /\s+/g;
const SENTENCE_END = /[.!?]["'”’)\]*_~]*(?=\s|$)/g;
const OPENING = /^["'“‘([*_~]+/;
const ORDINAL = /^\d+\.$/;
const LIST_OPENING = /(?:^|[(,:;])[\s*_~]*$/;
const ABBREVIATIONS: ReadonlySet<string> = new Set([
  'cf.',
  'e.g.',
  'etc.',
  'i.e.',
  'vs.',
]);

// A terminator inside code or after an abbreviation does not end the sentence,
// nor does one after a step number — a number that opens the statement or
// follows a list mark, as in "the steps: 1. lint, 2. test"; a closing quote,
// bracket or emphasis mark belongs to the sentence.
const endsSentence = (input: { index: number; masked: string }): boolean => {
  const word = input.masked
    .slice(input.masked.lastIndexOf(' ', input.index) + 1, input.index + 1)
    .replace(OPENING, '');
  const before = input.masked.slice(0, input.index + 1 - word.length);

  return !(
    ABBREVIATIONS.has(word.toLowerCase()) ||
    (ORDINAL.test(word) && LIST_OPENING.test(before))
  );
};

const headlineOf = (statement: string): string => {
  const text = statement.replaceAll(WHITESPACE, ' ').trim();
  const masked = blankInlineCode(text);
  const end = [
    ...masked.matchAll(SENTENCE_END),
  ].find((match) =>
    endsSentence({
      index: match.index,
      masked,
    }),
  );

  return end === undefined ? text : text.slice(0, end.index + end[0].length);
};

export { headlineOf };
