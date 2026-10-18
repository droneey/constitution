// Stryker disable all: the handler runs only in the server the build starts, over the content fumadocs-mdx's bundler plugin compiles, which no spec can run; the built site proves it
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/llms.txt')({
  server: {
    handlers: {
      // biome-ignore lint/style/useNamingConvention: TanStack Start keys a route's server handlers by their HTTP method
      GET: async () =>
        new Response(
          await (await import('#/features/content/adapters/fumadocs')).contentLlms().index(),
        ),
    },
  },
});
