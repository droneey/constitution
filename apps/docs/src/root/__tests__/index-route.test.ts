import { describe, expect, it } from 'bun:test';

import {
  createMemoryHistory,
  createRootRouteWithContext,
  createRoute,
  createRouter,
} from '@tanstack/react-router';

import { Route } from '../routes/index';
import type { RouterContext } from '../wiring';
import { docsContentFake } from './docs-content.fake';

const routerAt = (address: string) => {
  const root = createRootRouteWithContext<RouterContext>()();
  const routeTree = root.addChildren([
    createRoute({
      ...Route.options,
      getParentRoute: () => root,
      path: '/',
    }),
    createRoute({
      getParentRoute: () => root,
      path: '/docs/$',
    }),
  ]);

  return createRouter({
    context: {
      docs: docsContentFake().docs,
    },
    history: createMemoryHistory({
      initialEntries: [
        address,
      ],
    }),
    routeTree,
  });
};

describe('index route', () => {
  it('should send the reader to the overview of the documentation when the site opens', async () => {
    // Arrange
    const router = routerAt('/');

    // Act
    await router.load();

    // Assert
    expect(router.state.location.pathname).toBe('/docs');
  });
});
