import { afterEach, describe, expect, test } from 'bun:test';

import type { ReactElement } from 'react';

import {
  createMemoryHistory,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RootProvider } from 'fumadocs-ui/provider/tanstack';

import { DocsNotFoundScreen } from '#/composition/docs';

import { Route } from '../routes/docs/$';
import type { RouterContext } from '../wiring';
import type { DocsContentFake } from './docs-content.fake';
import { docsContentFake } from './docs-content.fake';

afterEach(cleanup);

/** the site's router over the documentation's route alone, at this address */
const routerAt = (address: string, content: DocsContentFake) => {
  const root = createRootRouteWithContext<RouterContext>()({
    // the root's providers, as the site's root route mounts them
    component: (): ReactElement => (
      <RootProvider
        theme={{
          enabled: false,
        }}
      >
        <Outlet />
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
    // as the site's router declares it
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

const lastMatchOf = (router: ReturnType<typeof routerAt>) => router.state.matches.at(-1);

describe('docs route', () => {
  test('should read the page the address names', async () => {
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

  test("should read an abstract block's page, whose id opens with its mark", async () => {
    // Arrange
    const content = docsContentFake();
    const router = routerAt('/docs/domains/_api', content);

    // Act
    await router.load();

    // Assert
    expect(content.loads).toStrictEqual([
      [
        'domains',
        '_api',
      ],
    ]);
  });

  test('should read the overview when the address names no page', async () => {
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

  test.each([
    {
      address: '/docs/guides/Write-a-pack',
      condition: 'a segment holds a capital',
    },
    {
      address: '/docs/guides/-draft',
      condition: 'a segment starts with a character no slug holds',
    },
    {
      address: '/docs/domains/__api',
      condition: 'a segment opens with more than the one mark of an abstract block',
    },
    {
      address: '/docs/guides/write_a_pack',
      condition: 'a segment ends with a character no slug holds',
    },
    {
      address: '/docs/a/b/c/d/e/f/g',
      condition: 'it is deeper than any page',
    },
  ])('should find no page, and read none, when $condition', async ({ address }) => {
    // Arrange
    const content = docsContentFake();
    const router = routerAt(address, content);

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

  test('should load the page body before the page renders', async () => {
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

  test('should title the tab with the page and the site', async () => {
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

  test('should title the tab with the site alone when the address names no page', async () => {
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

  test('should hand the screen the page and the tree of the sidebar', async () => {
    // Arrange
    const router = routerAt('/docs/guides/write-a-pack', docsContentFake());

    // Act
    render(<RouterProvider router={router} />);

    // Assert
    expect([
      (
        await screen.findByRole('heading', {
          level: 1,
        })
      ).textContent,
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

  test('should hand the screen the address the browser shows', async () => {
    // Arrange
    const router = routerAt('/docs/guides/write-a-pack', docsContentFake());
    render(<RouterProvider router={router} />);

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
    ).toBe('/docs/guides/write-a-pack');
  });

  test('should show not found when the page body has left its collection', async () => {
    // Arrange
    const router = routerAt('/docs/guides/moved', docsContentFake());

    // Act
    render(<RouterProvider router={router} />);

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
