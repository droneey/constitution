import type { ReactElement } from 'react';

import type { SidebarProps } from '#/libs/ui';
import { Sidebar, useSidebar } from '#/libs/ui';

import { SidebarState } from '../../../domain/entities';
import { useMarkSidebar } from '../../bindings';

export function DocsSidebarWidget(props: SidebarProps): ReactElement {
  const { collapsed } = useSidebar();

  useMarkSidebar(collapsed ? SidebarState.Collapsed : SidebarState.Open);

  return <Sidebar {...props} />;
}
