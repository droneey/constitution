import type { ReactElement } from 'react';

import type { FullSearchTriggerProps } from '#/libs/ui';
import { FullSearchTrigger } from '#/libs/ui';

import { DocsVersionWidget } from '../docs-version-widget';

export function DocsSidebarFieldsWidget(props: FullSearchTriggerProps): ReactElement {
  return (
    <>
      <DocsVersionWidget />
      <FullSearchTrigger {...props} />
    </>
  );
}
