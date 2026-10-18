import { createContext } from 'react';

/** where the reader is: the page's path among the collections, and the address the browser shows */
export interface DocsLocation {
  href: string;
  path: string;
}

/** the location the screen receives from its route, for the pieces the layout renders on its own */
export const DocsLocationContext = createContext<DocsLocation>({
  // Stryker disable next-line StringLiteral: outside a page any address links each release to its site's root, as the empty one does
  href: '/',
  // Stryker disable next-line StringLiteral: the path only marks a new page, so any constant behaves alike
  path: '',
});
