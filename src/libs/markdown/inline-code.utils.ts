const CODE_SPAN = /(`+)([\s\S]*?[^`])\1(?!`)/g;

const inlineCodeSpans = (text: string): readonly string[] =>
  [
    ...text.matchAll(CODE_SPAN),
  ].map((match) => (match[2] ?? '').trim());

const withoutInlineCode = (text: string): string =>
  text.replaceAll(CODE_SPAN, ' ');

export { inlineCodeSpans, withoutInlineCode };
