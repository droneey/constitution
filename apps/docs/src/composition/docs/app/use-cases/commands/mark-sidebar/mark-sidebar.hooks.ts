import { use, useLayoutEffect } from 'react';

import type { SidebarState } from '../../../../domain/entities';
import { MarkSidebarContext } from './mark-sidebar.context';

export function useMarkSidebar(state: SidebarState): void {
  const markSidebar = use(MarkSidebarContext);

  useLayoutEffect(() => {
    markSidebar?.(state);
  }, [
    markSidebar,
    state,
  ]);
}
