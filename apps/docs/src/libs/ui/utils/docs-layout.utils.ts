import { DRAWER_QUERY, QUERY_MATCHING_NOTHING } from '../constants';

/** called before the first render */
function keepOneLayout(): void {
  const matchMedia = globalThis.matchMedia.bind(globalThis);

  globalThis.matchMedia = (query: string): MediaQueryList =>
    matchMedia(query === DRAWER_QUERY ? QUERY_MATCHING_NOTHING : query);
}

export { keepOneLayout };
