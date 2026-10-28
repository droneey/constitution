import type { ReactElement } from 'react';

import type { SidebarProps } from '#/libs/ui';
import { Sidebar, useSidebar } from '#/libs/ui';

import { useMarkSidebar } from '../../../app/use-cases';
import { SidebarState } from '../../../domain/entities';

export function DocsSidebarWidget(props: SidebarProps): ReactElement {
  const { collapsed } = useSidebar();

  useMarkSidebar(collapsed ? SidebarState.Collapsed : SidebarState.Open);

  return <Sidebar {...props} />;
}
