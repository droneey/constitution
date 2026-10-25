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

export type { Term };
export { TermKind };
