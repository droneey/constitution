// Stryker disable all: the handler runs only in the server the build starts, over the content fumadocs-mdx's bundler plugin compiles, which no spec can run; the built site proves it
import { createFileRoute, notFound } from '@tanstack/react-router';

import { slugsOfMarkdownAddress } from '#/features/content';

export const Route = createFileRoute('/docs/{$}.md')({
  server: {
    handlers: {
      // biome-ignore lint/style/useNamingConvention: TanStack Start keys a route's server handlers by their HTTP method
      GET: async ({ params }) => {
        const { contentLlms, contentSource } = await import('#/features/content/adapters/fumadocs');
        const page = contentSource().getPage([
          ...slugsOfMarkdownAddress(params._splat?.split('/') ?? []),
        ]);
        if (!page) {
          throw notFound();
        }

        return new Response(await contentLlms().page(page), {
          headers: {
            'Content-Type': 'text/markdown',
          },
        });
      },
    },
  },
});
