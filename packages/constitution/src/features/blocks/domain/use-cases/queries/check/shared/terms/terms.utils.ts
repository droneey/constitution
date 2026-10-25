import { Term, TermKind } from '#/kernel/entities';
import { withoutCodeFences } from '#/kernel/utils';

import { inlineCodeSpans, maskInlineCode, withoutInlineCode } from '../markdown';
import { collapseWhitespace, ownedWordMatcher, WordKind, wordMatcher } from '../tokens';

interface TermsRead {
  /** the bold spans that are neither plain text nor one code span */
  readonly misshapen: readonly string[];
  readonly terms: readonly Term[];
}

// Strong emphasis as CommonMark reads it: no space just inside either pair of asterisks, and no
// blank line between them.
const BOLD = /\*\*(?![\s*])((?:[^*\n]|\n(?![ \t]*\n))+?)(?<![\s*])\*\*/g;
const BOLD_MARK = '**';
const PLAIN = /^[^`[\]]+$/;
const FOLDER_END = '/';
const SUFFIX_START = '.';

const wordMatcherOf =
  (kind: WordKind) =>
  (word: string): ((text: string) => boolean) =>
    wordMatcher({
      kind,
      word,
    });

// A concept, a folder and a suffix are words of their own form; any other term is matched as written.
const matcherOf: Readonly<Record<TermKind, (word: string) => (text: string) => boolean>> = {
  [TermKind.Api]: ownedWordMatcher,
  [TermKind.Brand]: ownedWordMatcher,
  [TermKind.Concept]: wordMatcherOf(WordKind.Concept),
  [TermKind.File]: ownedWordMatcher,
  [TermKind.Folder]: wordMatcherOf(WordKind.Folder),
  [TermKind.Suffix]: wordMatcherOf(WordKind.Suffix),
};

const isOneCodeSpan = (text: string): boolean =>
  inlineCodeSpans(text).length === 1 && withoutInlineCode(text).trim() === '';

/** The terms a block file's body defines: its bold spans outside code. */
const termsIn = (body: string): TermsRead => {
  const prose = withoutCodeFences(body);
  const terms: Term[] = [];
  const misshapen: string[] = [];

  for (const match of maskInlineCode(prose).matchAll(BOLD)) {
    const text = collapseWhitespace(
      prose.slice(match.index + BOLD_MARK.length, match.index + match[0].length - BOLD_MARK.length),
    );
    const name = isOneCodeSpan(text) ? inlineCodeSpans(text)[0] : undefined;

    if (name !== undefined) {
      terms.push(
        Term.of({
          isCode: true,
          text: name,
        }),
      );
    } else if (PLAIN.test(text)) {
      terms.push(
        Term.of({
          isCode: false,
          text,
        }),
      );
    } else {
      misshapen.push(text);
    }
  }

  return {
    misshapen,
    terms,
  };
};

const termMatcher = (term: Term): ((text: string) => boolean) => matcherOf[term.kind](term.term);

/** the spelling of a folder without its "/", or of a suffix without its "." */
const otherSpellingOf = (term: Term): string | undefined => {
  switch (term.kind) {
    case TermKind.Folder:
      return term.term.slice(0, -FOLDER_END.length);
    case TermKind.Suffix:
      return term.term.slice(SUFFIX_START.length);
    case TermKind.Api:
    case TermKind.Brand:
    case TermKind.Concept:
    case TermKind.File:
      return undefined;
    // Stryker disable next-line ConditionalExpression: no kind reaches the default, which only the compiler reads
    default:
      return term.kind satisfies never;
  }
};

export type { TermsRead };
export { otherSpellingOf, termMatcher, termsIn };
