import type { GlideLists } from '@droneey/design-browser/react-dom';

// Why: the sidebar is left out, since the library draws its own block for it.
export const GLIDE_LISTS: GlideLists = {
  "nav[aria-label='Versions']": {
    rowSelector: 'a',
    filledRowSelector: "[aria-current='page']",
  },
  '[data-toc-list]': {
    rowSelector: 'a',
  },
  '#fd-search-list': {
    rowSelector: "[role='option']",
    markAttribute: 'aria-selected',
  },
  "[role='menu']": {
    rowSelector: ":is([role='menuitem'], [role='menuitemradio']):not([role='group'] *)",
    markAttribute: 'data-highlighted',
  },
  "[role='group']:has(> [role='menuitemradio'])": {
    rowSelector: "[role='menuitemradio']",
    markAttribute: 'data-highlighted',
    filledRowSelector: "[aria-checked='true']",
  },
} as const;
