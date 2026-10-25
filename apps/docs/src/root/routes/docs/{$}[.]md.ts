import { createFileRoute, notFound } from '@tanstack/react-router';

import { slugsOfMarkdownAddress } from '#/features/content';

// Stryker disable next-line StringLiteral: the router takes the route's address from its file; the string only types it
export const Route = createFileRoute('/docs/{$}.md')({
  server: {
    handlers: {
      // biome-ignore lint/style/useNamingConvention: TanStack Start keys a route's server handlers by their HTTP method
      GET: async ({ context, params }) => {
        const markdown = await context.getPageMarkdown(
          slugsOfMarkdownAddress(params._splat?.split('/') ?? []),
        );

        if (markdown === undefined) {
          throw notFound();
        }

        return new Response(markdown, {
          headers: {
            'Content-Type': 'text/markdown',
          },
        });
      },
    },
  },
});
