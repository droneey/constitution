import type { DocumentFrame } from '../../domain/contracts';
import { NARROW_SCREEN_QUERY } from './document-frame.constants';

/** the frame's styles read the `data-sidebar` it marks with the sidebar's state */
export const documentFrame: DocumentFrame = {
  isNarrow: (): boolean => globalThis.matchMedia(NARROW_SCREEN_QUERY).matches,
  markSidebar: (state): void => {
    document.documentElement.dataset.sidebar = state;
  },
};
