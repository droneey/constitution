import { createFileRoute } from '@tanstack/react-router';

// Stryker disable next-line StringLiteral: the router takes the route's address from its file; the string only types it
export const Route = createFileRoute('/llms-full.txt')({
  server: {
    handlers: {
      // biome-ignore lint/style/useNamingConvention: TanStack Start keys a route's server handlers by their HTTP method
      GET: async ({ context }) => new Response(await context.getFullText()),
    },
  },
});
