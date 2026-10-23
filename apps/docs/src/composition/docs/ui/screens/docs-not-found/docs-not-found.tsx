import type { ReactElement } from 'react';

import { useGlide } from '@droneey/design-web/react-dom';

import { DefaultNotFound, HomeLayout } from '#/libs/ui';
import { mainContentId } from '#/shared/constants';

import { glideLists, layoutOptions } from '../../constants';

export function DocsNotFoundScreen(): ReactElement {
  useGlide(glideLists);

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
