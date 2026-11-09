import type { ReactElement, ReactNode } from 'react';

import { useGlide } from '@droneey/design-browser/react-dom';

import { HomeLayout } from '#/libs/ui';
import { MAIN_CONTENT_ID } from '#/shared/constants';

import { GLIDE_LISTS } from '../../constants';
import { DocsNavTitle } from '../docs-nav-title';
import { repositoryLink } from '../docs-repository-icon';

interface DocsHomeFrameProps {
  children: ReactNode;
}

export function DocsHomeFrame({ children }: DocsHomeFrameProps): ReactElement {
  useGlide(GLIDE_LISTS);

  return (
    <HomeLayout
      id={MAIN_CONTENT_ID}
      links={[
        repositoryLink,
      ]}
      nav={{
        title: <DocsNavTitle />,
      }}
      tabIndex={-1}
    >
      {children}
    </HomeLayout>
  );
}
