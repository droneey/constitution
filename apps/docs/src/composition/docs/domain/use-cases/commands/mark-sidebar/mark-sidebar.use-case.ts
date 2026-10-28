import type { DocumentFrame } from '../../../contracts';
import type { SidebarState } from '../../../entities';

export type MarkSidebar = (state: SidebarState) => void;

export const createMarkSidebar =
  (frame: DocumentFrame): MarkSidebar =>
  (state: SidebarState): void => {
    frame.markSidebar(state);
  };
