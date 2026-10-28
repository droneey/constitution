import type { ReactElement } from 'react';
import { use } from 'react';

import { createFileRoute, notFound, useLocation } from '@tanstack/react-router';

import type { DocsPageEntry } from '#/composition/docs';
import { DocsErrorScreen, DocsPageScreen } from '#/composition/docs';
import { Page, PageSlugs } from '#/features/content';
import type { PageBody } from '#/features/content/adapters/fumadocs-browser';
import { useFumadocsLoader } from '#/libs/ui';
import { APP_NAME } from '#/shared/constants';

import type { RouterContext } from '../../wiring';

/** throws not found when the page's collection holds no body at its path */
const bodyOf = (context: RouterContext, page: Page): PageBody => {
  const body = context.docs.getPageBody(page);

  if (body === undefined) {
    throw notFound();
  }

  return body;
};

function DocsRoute(): ReactElement {
  const page = Route.useLoaderData();
  const context = Route.useRouteContext();
  // a prerendered page leaves out the tree every page shares, so its hydration waits here for the
  // one file that holds it, and keeps the server's markup meanwhile
  const { navigation } = useFumadocsLoader({
    navigation: use(context.docs.loadNavigation()),
  });
  const { href } = useLocation();
  const entry: DocsPageEntry = {
    ...bodyOf(context, page),
    description: page.description,
    title: page.title,
  };

  return (
    <DocsPageScreen
      href={href}
      page={entry}
      pageKey={Page.keyOf(page)}
      pageTree={navigation}
    />
  );
}

const loadDocsPage = async ({
  context,
  params,
}: {
  context: RouterContext;
  params: {
    _splat?: string;
  };
}): Promise<Page> => {
  // Stryker disable next-line StringLiteral: the router always fills the splat, with the empty string for /docs itself
  const slugs = PageSlugs.ofAddress(params._splat ?? '');

  if (slugs === undefined) {
    throw notFound();
  }

  const [page] = await Promise.all([
    context.docs.getPage(slugs).then(async (found) => {
      await bodyOf(context, found).load();

      return found;
    }),
    context.docs.loadNavigation(),
  ]);

  return page;
};

const headOf = ({
  loaderData,
}: {
  loaderData?: Page;
}): {
  meta: {
    title: string;
  }[];
} => ({
  meta: [
    {
      title: loaderData === undefined ? APP_NAME : `${loaderData.title} · ${APP_NAME}`,
    },
  ],
});

// Stryker disable next-line StringLiteral: the router takes the route's address from its file; the string only types it
export const Route = createFileRoute('/docs/$')({
  component: DocsRoute,
  errorComponent: DocsErrorScreen,
  loader: loadDocsPage,
  head: headOf,
});
