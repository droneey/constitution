import { createContext } from 'react';

export interface DocsLocation {
  href: string;
  path: string;
}

/** for the pieces the layout renders on its own, which take no props from the screen */
export const DocsLocationContext = createContext<DocsLocation>({
  // Stryker disable next-line StringLiteral: outside a page any address links each release to its site's root, as the empty one does
  href: '/',
  // Stryker disable next-line StringLiteral: the path only marks a new page, so any constant behaves alike
  path: '',
});
