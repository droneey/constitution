// A span opens on a whole run of backticks that no odd number of backslashes
// escapes, and closes on a run as long within the same paragraph (CommonMark).
const CODE_SPAN =
  /(?<!(?:^|[^\\])(?:\\\\)*\\|`)(`+)(?!`)((?:(?!\n[ \t]*\n)[\s\S])*?[^`])\1(?!`)/g;
const NOT_NEWLINE = /[^\n]/g;
const BLANK = ' ';

const inlineCodeSpans = (text: string): readonly string[] =>
  [
    ...text.matchAll(CODE_SPAN),
  ].map((match) => (match[2] ?? '').trim());

const withoutInlineCode = (text: string): string =>
  text.replaceAll(CODE_SPAN, ' ');

// Every span blanked to spaces, its line breaks kept: an offset in the result
// is an offset in the text.
const blankInlineCode = (text: string): string =>
  text.replaceAll(CODE_SPAN, (span) => span.replaceAll(NOT_NEWLINE, BLANK));

export { blankInlineCode, inlineCodeSpans, withoutInlineCode };
