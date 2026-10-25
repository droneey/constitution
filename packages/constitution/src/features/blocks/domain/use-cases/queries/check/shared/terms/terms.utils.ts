import { withoutCodeFences } from '#/kernel/utils';

import { inlineCodeSpans, maskInlineCode, withoutInlineCode } from '../markdown';
import { collapseWhitespace, ownedWordMatcher, WordKind, wordMatcher } from '../tokens';

enum TermKind {
  Concept = 'concept',
  Brand = 'brand',
  Folder = 'folder',
  Suffix = 'suffix',
  File = 'file',
  Api = 'api',
}

interface Term {
  readonly kind: TermKind;
  readonly term: string;
}

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

const wordKindOf: ReadonlyMap<TermKind, WordKind> = new Map([
  [
    TermKind.Concept,
    WordKind.Concept,
  ],
  [
    TermKind.Folder,
    WordKind.Folder,
  ],
  [
    TermKind.Suffix,
    WordKind.Suffix,
  ],
]);

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

const termMatcher = (term: Term): ((text: string) => boolean) => {
  const kind = wordKindOf.get(term.kind);

  return kind === undefined
    ? ownedWordMatcher(term.term)
    : wordMatcher({
        kind,
        word: term.term,
      });
};

/** the spelling of a folder without its "/", or of a suffix without its "." */
const otherSpellingOf = (term: Term): string | undefined => {
  if (term.kind === TermKind.Folder) {
    return term.term.slice(0, -FOLDER_END.length);
  }

  return term.kind === TermKind.Suffix ? term.term.slice(SUFFIX_START.length) : undefined;
};

export type { Term, TermsRead };
export { otherSpellingOf, TermKind, termMatcher, termsIn };
