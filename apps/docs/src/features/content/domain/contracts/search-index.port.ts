export interface SearchIndex {
  /** the index of every page's text, in the shape the site's search reads, which the domain never reads */
  readonly export: () => Promise<unknown>;
}
