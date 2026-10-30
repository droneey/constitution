import { PATH_SEPARATOR } from '../constants';
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

/** what a bold term of a block file names */
enum TermKind {
  Concept = 'concept',
  Brand = 'brand',
  Folder = 'folder',
  Suffix = 'suffix',
  File = 'file',
  Api = 'api',
}

type RoleKind = TermKind.Folder | TermKind.Suffix;

interface Term {
  /** the stable name its definition gives right after the bold, `{#<id>}` */
  readonly id?: string;
  readonly kind: TermKind;
  readonly term: string;
}

/** a bold span that defines a term: the text of its one code span, or its plain words */
interface Bold {
  readonly isCode: boolean;
  readonly text: string;
}

interface TermsRead {
  /** the bold spans that are neither plain text nor one code span */
  readonly misshapen: readonly string[];
  readonly terms: readonly Term[];
}

// Why: strong emphasis as CommonMark reads it: no space just inside either pair of asterisks, and
// no blank line between them.
const BOLD = /\*\*(?![\s*])((?:[^*\n]|\n(?![ \t]*\n))+?)(?<![\s*])\*\*/g;
const BOLD_MARK = '**';
const PLAIN = /^[^`[\]]+$/;
const CONCEPT = /^[a-z]+(?:[ -][a-z]+)*$/;
const LEAD_IN_END = /[.:]$/;
const FILE_NAME = /^[\w-]+(?:\.[\w-]+)+$/;
const TERM_ID = /^\{#([^}\n]*)\}/;
const SUFFIX_START = '.';

const codeKindOf = (name: string): TermKind => {
  if (name.endsWith(PATH_SEPARATOR)) {
    return TermKind.Folder;
  }

  if (name.startsWith(SUFFIX_START)) {
    return TermKind.Suffix;
  }

  return FILE_NAME.test(name) ? TermKind.File : TermKind.Api;
};

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

/** the term a bold span defines, its whitespace already collapsed */
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

const matcherOfKind: Readonly<Record<TermKind, (word: string) => (text: string) => boolean>> = {
  [TermKind.Api]: ownedWordMatcher,
  [TermKind.Brand]: ownedWordMatcher,
  [TermKind.Concept]: wordMatcherOf(WordKind.Concept),
  [TermKind.File]: ownedWordMatcher,
  [TermKind.Folder]: wordMatcherOf(WordKind.Folder),
  [TermKind.Suffix]: wordMatcherOf(WordKind.Suffix),
};

/** the id written at the start of `text`, the text that follows a bold term */
const idAfter = (text: string): string | undefined => TERM_ID.exec(text)?.[1];

const withIdAfter = (input: { term: Term; text: string }): Term => {
  const id = idAfter(input.text);

  return id === undefined
    ? input.term
    : {
        ...input.term,
        id,
      };
};

const isRoleKind = (kind: TermKind): kind is RoleKind =>
  kind === TermKind.Folder || kind === TermKind.Suffix;

const isOneCodeSpan = (text: string): boolean =>
  inlineCodeSpans(text).length === 1 && withoutInlineCode(text).trim() === '';

/** the terms a block file's body defines: its bold spans outside code */
const allIn = (body: string): TermsRead => {
  const prose = withoutCodeFences(body);
  const terms: Term[] = [];
  const misshapen: string[] = [];

  for (const match of maskInlineCode(prose).matchAll(BOLD)) {
    const end = match.index + match[0].length;
    const text = collapseWhitespace(
      prose.slice(match.index + BOLD_MARK.length, end - BOLD_MARK.length),
    );
    const name = isOneCodeSpan(text) ? inlineCodeSpans(text)[0] : undefined;
    const after = prose.slice(end);

    if (name !== undefined) {
      terms.push(
        withIdAfter({
          term: of({
            isCode: true,
            text: name,
          }),
          text: after,
        }),
      );
    } else if (PLAIN.test(text)) {
      terms.push(
        withIdAfter({
          term: of({
            isCode: false,
            text,
          }),
          text: after,
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

/** the name a folder or a suffix gives a path: its term without the "/", or without the "." */
const roleNameOf = (role: { readonly kind: RoleKind; readonly term: string }): string =>
  role.kind === TermKind.Folder
    ? role.term.slice(0, -PATH_SEPARATOR.length)
    : role.term.slice(SUFFIX_START.length);

/** the spelling of a folder without its "/", or of a suffix without its "." */
const otherSpellingOf = (term: Term): string | undefined => {
  const { kind } = term;

  return isRoleKind(kind)
    ? roleNameOf({
        kind,
        term: term.term,
      })
    : undefined;
};

const Term = {
  allIn,
  idAfter,
  isRoleKind,
  matcherOf,
  of,
  otherSpellingOf,
  roleNameOf,
} as const;

export type { Bold, RoleKind, TermsRead };
export { Term, TermKind };
