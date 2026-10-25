import { NARROW_SCREEN_QUERY, SidebarMark } from './document-frame.constants';

/** the frame's styles read the `data-sidebar` it marks */
export const documentFrame = {
  isNarrow: (): boolean => globalThis.matchMedia(NARROW_SCREEN_QUERY).matches,
  markSidebarCollapsed: (): void => {
    document.documentElement.dataset.sidebar = SidebarMark.Collapsed;
  },
  markSidebarOpen: (): void => {
    document.documentElement.dataset.sidebar = SidebarMark.Open;
  },
};
