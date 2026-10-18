// biome-ignore-all lint/plugin/surface-only-re-exports: TanStack Router names the route of the site's root index.tsx, so this route file is no surface
import { createFileRoute, redirect } from '@tanstack/react-router';

/** the site is its documentation, so its root opens the overview */
const openTheOverview = (): never => {
  throw redirect({
    to: '/docs/$',
  });
};

// Stryker disable next-line StringLiteral: the router takes the route's address from its file; the string only types it
export const Route = createFileRoute('/')({
  beforeLoad: openTheOverview,
});
