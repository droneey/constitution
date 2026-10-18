// The library turns its sidebar into a drawer below 768 pixels; the site keeps one layout at every
// width, so the query it asks never matches.
const DRAWER_QUERY = '(width < 768px)';
const QUERY_MATCHING_NOTHING = 'not all';

/** keeps the library's layout at every width; called before the first render */
export function keepOneLayout(): void {
  const matchMedia = globalThis.matchMedia.bind(globalThis);

  globalThis.matchMedia = (query: string): MediaQueryList =>
    matchMedia(query === DRAWER_QUERY ? QUERY_MATCHING_NOTHING : query);
}
