import type { ReactElement } from 'react';

import { GITHUB_MARK } from './docs-repository-icon.constants';

// the library draws this mark as an unnamed image; the link carries the name, so the mark is hidden
export function DocsRepositoryIcon(): ReactElement {
  return (
    <svg
      aria-hidden
      fill='currentColor'
      viewBox='0 0 24 24'
    >
      <path d={GITHUB_MARK} />
    </svg>
  );
}
