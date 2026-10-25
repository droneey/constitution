import { useSidebar } from '#/libs/ui';

import { useMarkSidebar } from '../../../app/use-cases';
import { SidebarState } from '../../../domain/entities';

export function useSidebarOnFrame(): void {
  const { collapsed } = useSidebar();

  useMarkSidebar(collapsed ? SidebarState.Collapsed : SidebarState.Open);
}
