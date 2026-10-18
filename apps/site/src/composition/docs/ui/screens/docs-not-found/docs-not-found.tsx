import type { ReactElement } from 'react';

import { DefaultNotFound, HomeLayout, useGlide } from '#/libs/ui';

import { layoutOptions, mainContentId } from '../../constants';

/** an address the site has no page for */
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
