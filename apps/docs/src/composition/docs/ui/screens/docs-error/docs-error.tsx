import type { ReactElement } from 'react';

import { useGlide } from '@droneey/design-browser/react-dom';

import { HomeLayout } from '#/libs/ui';
import { MAIN_CONTENT_ID } from '#/shared/constants';

import { DocsNavTitle } from '../../components/docs-nav-title';
import { DocsRepositoryIcon } from '../../components/docs-repository-icon';
import { GLIDE_LISTS, REPOSITORY_LINK } from '../../constants';

/** in a page's place when it fails to load or render: what happened and what to do, never the failure itself */
export function DocsErrorScreen(): ReactElement {
  useGlide(GLIDE_LISTS);

  return (
    <HomeLayout
      id={MAIN_CONTENT_ID}
      links={[
        {
          ...REPOSITORY_LINK,
          icon: <DocsRepositoryIcon />,
        },
      ]}
      nav={{
        title: <DocsNavTitle />,
      }}
      tabIndex={-1}
    >
      <div className='flex flex-1 flex-col items-center justify-center gap-sm px-lg text-center'>
        <h1 className='text-2xl font-semibold'>This page could not be shown</h1>
        <p className='text-fd-muted-foreground'>Reload it, or go back home.</p>
        <a
          className='font-medium text-fd-primary underline'
          href='/'
        >
          Back to Home
        </a>
      </div>
    </HomeLayout>
  );
}
