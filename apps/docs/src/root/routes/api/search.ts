import { createFileRoute } from '@tanstack/react-router';

import type { SearchAPI } from 'fumadocs-core/search/server';
import { createFromSource } from 'fumadocs-core/search/server';

// the loader reads the repository, so only the server imports it
const searchServer = async (): Promise<SearchAPI> =>
  createFromSource((await import('#/features/content/adapters/fumadocs')).contentSource(), {
    // https://docs.orama.com/docs/orama-js/supported-languages
    language: 'english',
  });

export const Route = createFileRoute('/api/search')({
  server: {
    handlers: {
      // biome-ignore lint/style/useNamingConvention: TanStack Start keys a route's server handlers by their HTTP method
      GET: async () => (await searchServer()).staticGET(),
    },
  },
});
