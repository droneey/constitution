import type { SearchIndex } from '../../contracts';

export const createFakeSearchIndex = (exported: unknown): SearchIndex => ({
  export: () => Promise.resolve(exported),
});
