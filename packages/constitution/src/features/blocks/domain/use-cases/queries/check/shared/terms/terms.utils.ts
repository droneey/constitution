import { withoutCodeFences } from '#/kernel/utils';

import type { Term } from '../../../../../entities';
import { TermKind } from '../../../../../entities';
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
const CONCEPT = /^[a-z]+(?:[ -][a-z]+)*$/;
const LEAD_IN_END = /[.:]$/;
const FILE_NAME = /^[\w-]+(?:\.[\w-]+)+$/;
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

const codeKindOf = (name: string): TermKind => {
  if (name.endsWith(FOLDER_END)) {
    return TermKind.Folder;
  }

  if (name.startsWith(SUFFIX_START)) {
    return TermKind.Suffix;
  }

  return FILE_NAME.test(name) ? TermKind.File : TermKind.Api;
};

// A lead-in closes on "." or ":" and opens its sentence, so a capital that opens it is the
// sentence's, not the term's.
const plainTermOf = (text: string): Term => {
  const isLeadIn = LEAD_IN_END.test(text);
  const term = isLeadIn ? text.slice(0, -1) : text;
  const lowered = isLeadIn ? `${term.charAt(0).toLowerCase()}${term.slice(1)}` : term;

  return CONCEPT.test(lowered)
    ? {
        kind: TermKind.Concept,
        term: lowered,
      }
    : {
        kind: TermKind.Brand,
        term,
      };
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
      terms.push({
        kind: codeKindOf(name),
        term: name,
      });
    } else if (PLAIN.test(text)) {
      terms.push(plainTermOf(text));
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
