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

const Term = {
  of,
} as const;

export type { Bold };
export { Term, TermKind };
