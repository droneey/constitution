import type { ReactElement } from 'react';
import { Suspense } from 'react';

import type { PageTreeRoot } from '#/libs/ui';
import { DocsLayout } from '#/libs/ui';

import { DocsLocationContext } from '../../../app/providers';
import { DocsNavTitle } from '../../components/docs-nav-title';
import { DocsRepositoryIcon } from '../../components/docs-repository-icon';
import { REPOSITORY_LINK } from '../../constants';
import { DocsPageContent } from './components';
import { searchTrigger, sidebar } from './docs-page.constants';
import { useHasNavigated } from './docs-page.hooks';
import type { DocsPageEntry } from './docs-page.types';

interface DocsPageScreenProps {
  href: string;
  page: DocsPageEntry;
  pageTree: PageTreeRoot;
  path: string;
}

export function DocsPageScreen({ href, page, pageTree, path }: DocsPageScreenProps): ReactElement {
  const hasNavigated = useHasNavigated(path);

  return (
    <DocsLocationContext
      value={{
        href,
        path,
      }}
    >
      <DocsLayout
        links={[
          {
            ...REPOSITORY_LINK,
            icon: <DocsRepositoryIcon />,
          },
        ]}
        nav={{
          title: <DocsNavTitle />,
        }}
        slots={{
          searchTrigger,
          sidebar,
        }}
        tree={pageTree}
      >
        <Suspense>
          <DocsPageContent
            hasNavigated={hasNavigated}
            page={page}
            path={path}
          />
        </Suspense>
      </DocsLayout>
    </DocsLocationContext>
  );
}
