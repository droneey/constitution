const WHITESPACE = /\s+/g;
const WORD_START = '(?<![\\w.])';
const WORD_END = '(?!\\w)';
const DOT = '.';

const collapseWhitespace = (text: string): string =>
  text.replaceAll(WHITESPACE, ' ');

const containsId = (input: { id: string; text: string }): boolean =>
  new RegExp(`(?<![\\w.-])${RegExp.escape(input.id)}(?![\\w-])`, 'u').test(
    input.text,
  );

// A hyphen continues a block id, so "react-dom-extra" is not react-dom, but it
// ends an owned word, so "React-based" names React.
const ownedWordMatcher = (word: string): ((text: string) => boolean) => {
  const normalized = collapseWhitespace(word);
  const pattern = new RegExp(
    `${normalized.startsWith(DOT) ? '' : WORD_START}${RegExp.escape(normalized)}${WORD_END}`,
    'u',
  );

  return (text: string): boolean =>
    text.includes(normalized) && pattern.test(text);
};

export { collapseWhitespace, containsId, ownedWordMatcher };
