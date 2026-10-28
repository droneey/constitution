import { createFileRoute, redirect } from '@tanstack/react-router';

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
