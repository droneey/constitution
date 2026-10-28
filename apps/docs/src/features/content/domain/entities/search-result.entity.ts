enum SearchResultKind {
  Page = 'page',
  Heading = 'heading',
  Text = 'text',
}

interface SearchResult {
  readonly breadcrumbs: readonly string[];
  readonly content: string;
  readonly id: string;
  readonly kind: SearchResultKind;
  readonly table?: string;
  readonly url: string;
}

export type { SearchResult };
export { SearchResultKind };
