import type { ReactElement } from 'react';

import type { SidebarProps } from '#/libs/ui';
import { Sidebar } from '#/libs/ui';

import { useSidebarFrame } from './docs-sidebar-widget.hooks';

export function DocsSidebarWidget(props: SidebarProps): ReactElement {
  useSidebarFrame();

  return <Sidebar {...props} />;
}
