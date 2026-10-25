// biome-ignore lint/plugin/surface-only-re-exports: TanStack Router names the route of the site's root index.tsx, so this route file is no surface
import { createFileRoute, redirect } from '@tanstack/react-router';

// biome-ignore lint/plugin/surface-only-re-exports: TanStack Router names the route of the site's root index.tsx, so this route file is no surface
export const Route = createFileRoute(
  // Stryker disable next-line StringLiteral: the router takes the route's address from its file; the string only types it
  '/',
)({
  beforeLoad: (): never => {
    throw redirect({
      to: '/docs/$',
    });
  },
});
