/** below this width the open sidebar pushes the page out of view */
const NARROW = '(width < 48rem)';

/** the frame's styles read the `data-sidebar` it marks */
export const documentFrame = {
  isNarrow: (): boolean => globalThis.matchMedia(NARROW).matches,
  markSidebar: (collapsed: boolean): void => {
    document.documentElement.dataset.sidebar = collapsed ? 'collapsed' : 'open';
  },
};
