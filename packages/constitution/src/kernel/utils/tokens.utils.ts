const WHITESPACE = /\s+/g;
const WORD_START = '(?<![\\w.])';
const WORD_END = '(?!\\w)';
const DOT = '.';
const noLetterBefore: string = /(?<!\p{L})/u.source;
const noLetterAfter: string = /(?!\p{L})/u.source;
const noNameBefore: string = /(?<![\p{L}\p{N}-])/u.source;
const noNameAfter: string = /(?![\p{L}\p{N}-])/u.source;
const plural: string = /(?:e?s)?/.source;
const ANY_CASE = 'iu';

enum WordKind {
  Concept = 'concept',
  Folder = 'folder',
  Suffix = 'suffix',
}

const wordPatterns: Readonly<Record<WordKind, (word: string) => string>> = {
  [WordKind.Concept]: (word: string): string => `${noLetterBefore}${word}${plural}${noLetterAfter}`,
  [WordKind.Folder]: (word: string): string => `${noNameBefore}${word}`,
  [WordKind.Suffix]: (word: string): string => `${word}${noNameAfter}`,
};

const collapseWhitespace = (text: string): string => text.replaceAll(WHITESPACE, ' ');

/**
 * A hyphen continues a block id, so "react-dom-extra" is not react-dom, but it ends an owned word,
 * so "React-based" names React.
 */
const ownedWordMatcher = (word: string): ((text: string) => boolean) => {
  const normalized = collapseWhitespace(word);
  const pattern = new RegExp(
    `${normalized.startsWith(DOT) ? '' : WORD_START}${RegExp.escape(normalized)}${WORD_END}`,
  );

  return (text: string): boolean => text.includes(normalized) && pattern.test(text);
};

interface WordMatcherInput {
  readonly kind: WordKind;
  readonly word: string;
}

const wordMatcher = (input: WordMatcherInput): ((text: string) => boolean) => {
  const pattern = new RegExp(wordPatterns[input.kind](RegExp.escape(input.word)), ANY_CASE);

  return (text: string): boolean => pattern.test(text);
};

export { collapseWhitespace, ownedWordMatcher, WordKind, wordMatcher };
