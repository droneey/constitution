import { afterEach, describe, expect, it } from 'bun:test';

import type { ReactElement } from 'react';

import {
  createMemoryHistory,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';

import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DocsBuiltVersionContext, DocsNotFoundScreen } from '#/composition/docs';
import { Version } from '#/features/versions';
import { RootProvider } from '#/libs/ui';

import { Route } from '../routes/docs/$';
import type { RouterContext } from '../wiring';
import type { DocsContentFake } from './docs-content.fake';
import { docsContentFake, navigationFixture } from './docs-content.fake';

afterEach(cleanup);

const routerAt = (address: string, content: DocsContentFake) => {
  const root = createRootRouteWithContext<RouterContext>()({
    component: (): ReactElement => (
      <RootProvider
        theme={{
          enabled: false,
        }}
      >
        <DocsBuiltVersionContext value={Version.create('0.70.0')}>
          <Outlet />
        </DocsBuiltVersionContext>
      </RootProvider>
    ),
  });
  const routeTree = root.addChildren([
    createRoute({
      ...Route.options,
      getParentRoute: () => root,
      path: '/docs/$',
    }),
  ]);

  return createRouter({
    defaultNotFoundComponent: DocsNotFoundScreen,
    context: {
      docs: content.docs,
    },
    history: createMemoryHistory({
      initialEntries: [
        address,
      ],
    }),
    routeTree,
  });
};

const renderRouter = async (router: ReturnType<typeof routerAt>): Promise<void> => {
  await act(() => Promise.resolve(render(<RouterProvider router={router} />)));
};

const lastMatchOf = (router: ReturnType<typeof routerAt>) => router.state.matches.at(-1);

describe('docs route', () => {
  it('should read the page the address names', async () => {
    // Arrange
    const content = docsContentFake();
    const router = routerAt('/docs/guides/write-a-pack', content);

    // Act
    await router.load();

    // Assert
    expect(content.loads).toStrictEqual([
      [
        'guides',
        'write-a-pack',
      ],
    ]);
  });

  it('should read the overview when the address names no page', async () => {
    // Arrange
    const content = docsContentFake();
    const router = routerAt('/docs', content);

    // Act
    await router.load();

    // Assert
    expect(content.loads).toStrictEqual([
      [],
    ]);
  });

  it('should find no page, and read none, when no page can have the address', async () => {
    // Arrange
    const content = docsContentFake();
    const router = routerAt('/docs/guides/Write-a-pack', content);

    // Act
    await router.load();

    // Assert
    expect([
      content.loads,
      lastMatchOf(router)?.status,
    ]).toStrictEqual([
      [],
      'notFound',
    ]);
  });

  it('should load the page body before the page renders', async () => {
    // Arrange
    const content = docsContentFake();
    const router = routerAt('/docs/guides/write-a-pack', content);

    // Act
    await router.load();

    // Assert
    expect(content.preloads).toStrictEqual([
      'guide:guides/write-a-pack.md',
    ]);
  });

  it('should read the tree of the sidebar with the page, before the page renders', async () => {
    // Arrange
    const content = docsContentFake();
    const router = routerAt('/docs/guides/write-a-pack', content);

    // Act
    await router.load();

    // Assert
    expect(Reflect.get(content.docs.loadNavigation(), 'value')).toStrictEqual(navigationFixture());
  });

  it('should show the sidebar in its first render when the tree was read before', async () => {
    // Arrange
    const router = routerAt('/docs/guides/write-a-pack', docsContentFake());

    await router.load();

    // Act
    await renderRouter(router);

    // Assert
    expect(
      screen
        .getByRole('link', {
          name: 'Overview',
        })
        .getAttribute('href'),
    ).toBe('/docs');
  });

  it('should title the tab with the page and the site', async () => {
    // Arrange
    const router = routerAt('/docs/guides/write-a-pack', docsContentFake());

    // Act
    await router.load();

    // Assert
    expect(lastMatchOf(router)?.meta).toStrictEqual([
      {
        title: 'Write a pack · Constitution',
      },
    ]);
  });

  it('should title the tab with the site alone when the address names no page', async () => {
    // Arrange
    const router = routerAt('/docs/guides/Write-a-pack', docsContentFake());

    // Act
    await router.load();

    // Assert
    expect(lastMatchOf(router)?.meta).toStrictEqual([
      {
        title: 'Constitution',
      },
    ]);
  });

  it('should hand the screen the page and the tree of the sidebar', async () => {
    // Arrange
    const router = routerAt('/docs/guides/write-a-pack', docsContentFake());

    // Act
    await renderRouter(router);

    // Assert
    expect([
      screen.getByRole('heading', {
        level: 1,
      }).textContent,
      screen
        .getByRole('link', {
          name: 'Overview',
        })
        .getAttribute('href'),
    ]).toStrictEqual([
      'Write a pack',
      '/docs',
    ]);
  });

  it('should hand the screen the address the browser shows', async () => {
    // Arrange
    const router = routerAt('/docs/guides/write-a-pack', docsContentFake());

    await renderRouter(router);

    // Act
    await userEvent.click(
      await screen.findByRole('button', {
        name: /^v/,
      }),
    );

    // Assert
    expect(
      (
        await screen.findByRole('link', {
          name: /^v/,
        })
      ).getAttribute('href'),
    ).toBe('/v0.70.0/docs/guides/write-a-pack');
  });

  it('should move focus to the heading of the next page when two collections hold its file under one path', async () => {
    // Arrange
    const router = routerAt('/docs', docsContentFake());

    await renderRouter(router);
    await screen.findByRole('heading', {
      level: 1,
      name: 'Overview',
    });

    // Act
    await act(() =>
      router.navigate({
        params: {
          _splat: 'quick-start',
        },
        to: '/docs/$',
      }),
    );

    // Assert
    expect(document.activeElement).toBe(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Quick start',
      }),
    );
  });

  it('should show not found when the page body has left its collection', async () => {
    // Arrange
    const router = routerAt('/docs/guides/moved', docsContentFake());

    // Act
    await renderRouter(router);

    // Assert
    expect(
      (
        await screen.findByRole('heading', {
          level: 1,
        })
      ).textContent,
    ).toBe('404');
  });
});
