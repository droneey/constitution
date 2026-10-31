import type { ReactElement } from 'react';

import { DefaultNotFound } from '#/libs/ui';

import { DocsHomeFrame } from '../../components';

export function DocsNotFoundScreen(): ReactElement {
  return (
    <DocsHomeFrame>
      <DefaultNotFound />
    </DocsHomeFrame>
  );
}
