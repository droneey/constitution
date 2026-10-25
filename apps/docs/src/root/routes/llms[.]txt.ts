import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/llms.txt')({
  server: {
    handlers: {
      // biome-ignore lint/style/useNamingConvention: TanStack Start keys a route's server handlers by their HTTP method
      GET: async () =>
        new Response((await import('#/features/content/adapters/fumadocs')).contentLlms().index()),
    },
  },
});
