import type { Router } from '@tanstack/react-router';
import { createRouter } from '@tanstack/react-router';

import { DocsNotFoundScreen } from '#/composition/docs';

import { routeTree } from './routeTree.gen';
import { routerContext } from './wiring';

/** the router the framework asks for */
export function getRouter(): Router<typeof routeTree> {
  return createRouter({
    context: routerContext,
    defaultNotFoundComponent: DocsNotFoundScreen,
    defaultPreload: 'intent',
    defaultViewTransition: true,
    routeTree,
    scrollRestoration: true,
  });
}
