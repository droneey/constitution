import { createFileRoute, notFound } from '@tanstack/react-router';

import { PageSlugs } from '#/features/content';

// Stryker disable next-line StringLiteral: the router takes the route's address from its file; the string only types it
export const Route = createFileRoute('/docs/{$}.md')({
  server: {
    handlers: {
      /** @throws {NotFoundError} when no page has the Markdown address */
      // biome-ignore lint/style/useNamingConvention: TanStack Start keys a route's server handlers by their HTTP method
      GET: async ({ context, params }) => {
        const slugs = PageSlugs.ofMarkdownAddress(params._splat ?? '');
        const markdown = slugs === undefined ? undefined : await context.getPageMarkdown(slugs);

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
