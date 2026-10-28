enum SearchResultKind {
  Page = 'page',
  Heading = 'heading',
  Text = 'text',
}

interface SearchResult {
  /** the titles of the page and of the sections above the result, outermost first */
  readonly breadcrumbs: readonly string[];
  readonly content: string;
  readonly id: string;
  readonly kind: SearchResultKind;
  /** the table a result found in a table's row belongs to, unique in its page */
  readonly table?: string;
  readonly url: string;
}

export type { SearchResult };
export { SearchResultKind };
