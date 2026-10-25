import type { ReactElement } from 'react';

import { useGlide } from '@droneey/design-browser/react-dom';

import { DefaultNotFound, HomeLayout } from '#/libs/ui';
import { MAIN_CONTENT_ID } from '#/shared/constants';

import { DocsNavTitle } from '../../components/docs-nav-title';
import { DocsRepositoryIcon } from '../../components/docs-repository-icon';
import { GLIDE_LISTS, REPOSITORY_LINK } from '../../constants';

export function DocsNotFoundScreen(): ReactElement {
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
      <DefaultNotFound />
    </HomeLayout>
  );
}
