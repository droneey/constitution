import type { SidebarState } from '../entities';

export interface DocumentFrame {
  /** whether the open sidebar would push the page out of view */
  readonly isNarrow: () => boolean;
  readonly markSidebar: (state: SidebarState) => void;
}
