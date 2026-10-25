import type { ReactElement } from 'react';

import { Icon, IconName } from '@droneey/design-browser/react-dom';

import { APP_NAME } from '#/shared/constants';

export function DocsNavTitle(): ReactElement {
  return (
    <>
      <Icon
        className='text-fd-primary'
        name={IconName.Home}
      />
      <span className='text-gradient-accent'>{APP_NAME}</span>
    </>
  );
}
