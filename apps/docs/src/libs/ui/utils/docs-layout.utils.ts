import { DRAWER_QUERY, QUERY_MATCHING_NOTHING } from '../constants';

// Why: the library asks for its query on the first render, so this runs before it.
function keepOneLayout(): void {
  const matchMedia = globalThis.matchMedia.bind(globalThis);

  globalThis.matchMedia = (query: string): MediaQueryList =>
    matchMedia(query === DRAWER_QUERY ? QUERY_MATCHING_NOTHING : query);
}

export { keepOneLayout };
