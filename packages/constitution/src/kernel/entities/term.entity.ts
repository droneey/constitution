import {
  collapseWhitespace,
  inlineCodeSpans,
  maskInlineCode,
  ownedWordMatcher,
  WordKind,
  withoutCodeFences,
  withoutInlineCode,
  wordMatcher,
} from '../utils';

/** What a bold term of a block file names. */
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

/** A bold span that defines a term: the text of its one code span, or its plain words. */
interface Bold {
  readonly isCode: boolean;
  readonly text: string;
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
const PLAIN = /^[^`[\]]+$/;
const CONCEPT = /^[a-z]+(?:[ -][a-z]+)*$/;
const LEAD_IN_END = /[.:]$/;
const FILE_NAME = /^[\w-]+(?:\.[\w-]+)+$/;
const FOLDER_END = '/';
const SUFFIX_START = '.';

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

/** The term a bold span defines, its whitespace already collapsed. */
const of = (bold: Bold): Term =>
  bold.isCode
    ? {
        kind: codeKindOf(bold.text),
        term: bold.text,
      }
    : plainTermOf(bold.text);

const wordMatcherOf =
  (kind: WordKind) =>
  (word: string): ((text: string) => boolean) =>
    wordMatcher({
      kind,
      word,
    });

// A concept, a folder and a suffix are words of their own form; any other term is matched as written.
const matcherOfKind: Readonly<Record<TermKind, (word: string) => (text: string) => boolean>> = {
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
const allIn = (body: string): TermsRead => {
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
        of({
          isCode: true,
          text: name,
        }),
      );
    } else if (PLAIN.test(text)) {
      terms.push(
        of({
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

const matcherOf = (term: Term): ((text: string) => boolean) => matcherOfKind[term.kind](term.term);

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

const Term = {
  allIn,
  matcherOf,
  of,
  otherSpellingOf,
} as const;

export type { Bold, TermsRead };
export { Term, TermKind };
