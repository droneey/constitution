import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/llms-full.txt')({
  server: {
    handlers: {
      // biome-ignore lint/style/useNamingConvention: TanStack Start keys a route's server handlers by their HTTP method
      GET: async () =>
        new Response(
          await (await import('#/features/content/adapters/fumadocs')).contentLlms().full(),
        ),
    },
  },
});
