import type { ReactElement } from 'react';

import { DefaultNotFound, HomeLayout, useGlide } from '#/libs/ui';
import { mainContentId } from '#/shared/constants';

import { layoutOptions } from '../../constants';

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
