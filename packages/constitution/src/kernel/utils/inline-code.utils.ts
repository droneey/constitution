// A span opens on a whole run of backticks that no odd number of backslashes
// escapes, and closes on a run as long within the same paragraph (CommonMark).
const CODE_SPAN = /(?<!(?:^|[^\\])(?:\\\\)*\\|`)(`+)(?!`)((?:(?!\n[ \t]*\n)[\s\S])*?[^`])\1(?!`)/g;

const inlineCodeSpans = (text: string): readonly string[] =>
  [
    ...text.matchAll(CODE_SPAN),
  ].map(
    // Stryker disable next-line StringLiteral: group 2 always takes part
    (match) => (match[2] ?? '').trim(),
  );

const withoutInlineCode = (text: string): string => text.replaceAll(CODE_SPAN, ' ');

const MASK = '\u0000';

// Each span becomes a run of NUL as long as it, so an offset in the masked text is one in the text.
const maskInlineCode = (text: string): string =>
  text.replaceAll(CODE_SPAN, (span) => MASK.repeat(span.length));

export { inlineCodeSpans, maskInlineCode, withoutInlineCode };
