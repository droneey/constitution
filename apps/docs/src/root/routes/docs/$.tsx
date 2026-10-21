import type { ReactElement } from 'react';

import { createFileRoute, notFound, useLocation } from '@tanstack/react-router';

import { DocsPageScreen } from '#/composition/docs';
import { useFumadocsLoader } from '#/libs/ui';
import { appName } from '#/shared/constants';

import { slugsShape } from '../../constants';
import type { DocsPageData, RouterContext } from '../../wiring';

function DocsRoute(): ReactElement {
  const loaded = useFumadocsLoader(Route.useLoaderData());
  const { href } = useLocation();
  const { docs } = Route.useRouteContext();

  return (
    <DocsPageScreen
      href={href}
      page={docs.pageOf(loaded)}
      pageTree={loaded.pageTree}
      path={loaded.path}
    />
  );
}

/** loads the body before the page renders */
const loadDocsPage = async ({
  context,
  params,
}: {
  context: RouterContext;
  params: {
    _splat?: string;
  };
}): Promise<DocsPageData> => {
  const slugs = slugsShape.safeParse(
    // Stryker disable next-line StringLiteral: the router always fills the splat, with the empty string for /docs itself
    (params._splat ?? '').split('/').filter((segment) => segment !== ''),
  );

  if (!slugs.success) {
    throw notFound();
  }
  const loaded = await context.docs.loadPage(slugs.data);

  await context.docs.pageOf(loaded).preload();
  return loaded;
};

const headOf = ({
  loaderData,
}: {
  loaderData?: DocsPageData;
}): {
  meta: {
    title: string;
  }[];
} => ({
  meta: [
    {
      title: loaderData === undefined ? appName : `${loaderData.title} · ${appName}`,
    },
  ],
});

// Stryker disable next-line StringLiteral: the router takes the route's address from its file; the string only types it
export const Route = createFileRoute('/docs/$')({
  component: DocsRoute,
  loader: loadDocsPage,
  head: headOf,
});
