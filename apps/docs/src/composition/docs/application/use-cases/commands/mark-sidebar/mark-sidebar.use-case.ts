import type { SidebarState } from '../../../../domain/sidebar-state/entities';
import type { DocumentFrame } from '../../../contracts';

export type MarkSidebar = (state: SidebarState) => void;

export const createMarkSidebar =
  (frame: DocumentFrame): MarkSidebar =>
  (state: SidebarState): void => {
    frame.markSidebar(state);
  };
