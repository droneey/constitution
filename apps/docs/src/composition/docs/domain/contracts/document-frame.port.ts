import type { SidebarState } from '../entities';

export interface DocumentFrame {
  readonly isNarrow: () => boolean;
  readonly markSidebar: (state: SidebarState) => void;
}
