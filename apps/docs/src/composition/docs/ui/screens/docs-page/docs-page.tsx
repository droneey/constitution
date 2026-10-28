import type { ReactElement } from 'react';
import { Suspense } from 'react';

import type { PageTreeRoot } from '#/libs/ui';
import { DocsLayout } from '#/libs/ui';

import { DocsLocationContext } from '../../../app/providers';
import { DocsNavTitle, repositoryLink } from '../../components';
import { DocsPageContent } from './components';
import { searchTrigger, sidebar } from './docs-page.constants';
import { useHasNavigated } from './docs-page.hooks';
import type { DocsPageEntry } from './docs-page.types';

interface DocsPageScreenProps {
  href: string;
  page: DocsPageEntry;
  pageKey: string;
  pageTree: PageTreeRoot;
}

export function DocsPageScreen({
  href,
  page,
  pageKey,
  pageTree,
}: DocsPageScreenProps): ReactElement {
  const hasNavigated = useHasNavigated(pageKey);

  return (
    <DocsLocationContext
      value={{
        href,
      }}
    >
      <DocsLayout
        links={[
          repositoryLink,
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
            pageKey={pageKey}
          />
        </Suspense>
      </DocsLayout>
    </DocsLocationContext>
  );
}
