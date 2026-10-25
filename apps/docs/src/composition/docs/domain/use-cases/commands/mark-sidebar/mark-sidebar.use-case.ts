import type { DocumentFrame } from '../../../contracts';
import { SidebarState } from '../../../entities';

/** marks the frame with the sidebar's state, which the frame's styles read */
export type MarkSidebar = (state: SidebarState) => void;

export const createMarkSidebar =
  (frame: DocumentFrame): MarkSidebar =>
  (state: SidebarState): void => {
    if (state === SidebarState.Collapsed) {
      frame.markSidebarCollapsed();
    } else {
      frame.markSidebarOpen();
    }
  };
