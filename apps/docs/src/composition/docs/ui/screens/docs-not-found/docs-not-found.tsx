import type { ReactElement } from 'react';

import { DefaultNotFound, HomeLayout, useGlide } from '#/libs/ui';

import { layoutOptions, mainContentId } from '../../constants';

export function DocsNotFoundScreen(): ReactElement {
  useGlide();

  return (
    <HomeLayout
      {...layoutOptions}
      id={mainContentId}
      tabIndex={-1}
    >
      <DefaultNotFound />
    </HomeLayout>
  );
}
