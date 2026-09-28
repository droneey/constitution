const WHITESPACE = /\s+/g;
const WORD_START = '(?<![\\w.])';
const WORD_END = '(?!\\w)';
const DOT = '.';
const NO_LETTER_BEFORE: string = /(?<!\p{L})/u.source;
const NO_LETTER_AFTER: string = /(?!\p{L})/u.source;
const NO_NAME_BEFORE: string = /(?<![\p{L}\p{N}-])/u.source;
const NO_NAME_AFTER: string = /(?![\p{L}\p{N}-])/u.source;
const PLURAL: string = /(?:e?s)?/.source;
const ANY_CASE = 'iu';

enum WordKind {
  Concept = 'concept',
  Folder = 'folder',
  Suffix = 'suffix',
}

const WORD_PATTERNS: Readonly<Record<WordKind, (word: string) => string>> = {
  [WordKind.Concept]: (word: string): string =>
    `${NO_LETTER_BEFORE}${word}${PLURAL}${NO_LETTER_AFTER}`,
  [WordKind.Folder]: (word: string): string => `${NO_NAME_BEFORE}${word}`,
  [WordKind.Suffix]: (word: string): string => `${word}${NO_NAME_AFTER}`,
};

const collapseWhitespace = (text: string): string =>
  text.replaceAll(WHITESPACE, ' ');

const containsId = (input: { id: string; text: string }): boolean =>
  new RegExp(`(?<![\\w.-])${RegExp.escape(input.id)}(?![\\w-])`).test(
    input.text,
  );

// A hyphen continues a block id, so "react-dom-extra" is not react-dom, but it
// ends an owned word, so "React-based" names React.
const ownedWordMatcher = (word: string): ((text: string) => boolean) => {
  const normalized = collapseWhitespace(word);
  const pattern = new RegExp(
    `${normalized.startsWith(DOT) ? '' : WORD_START}${RegExp.escape(normalized)}${WORD_END}`,
  );

  return (text: string): boolean =>
    text.includes(normalized) && pattern.test(text);
};

const wordMatcher = (input: {
  kind: WordKind;
  word: string;
}): ((text: string) => boolean) => {
  const pattern = new RegExp(
    WORD_PATTERNS[input.kind](RegExp.escape(input.word)),
    ANY_CASE,
  );

  return (text: string): boolean => pattern.test(text);
};

export {
  collapseWhitespace,
  containsId,
  ownedWordMatcher,
  WordKind,
  wordMatcher,
};
