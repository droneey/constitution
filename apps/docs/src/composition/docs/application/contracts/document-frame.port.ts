import type { SidebarState } from '../../domain/entities';

export interface DocumentFrame {
  readonly isNarrow: () => boolean;
  readonly markSidebar: (state: SidebarState) => void;
}
