import type { SidebarState } from '../../domain/sidebar-state/entities';

export interface DocumentFrame {
  readonly isNarrow: () => boolean;
  readonly markSidebar: (state: SidebarState) => void;
}
