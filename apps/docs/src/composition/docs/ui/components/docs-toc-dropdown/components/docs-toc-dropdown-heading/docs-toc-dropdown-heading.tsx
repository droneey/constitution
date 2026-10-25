import type { ReactElement, ReactNode } from 'react';

import { useTocSelector } from '#/libs/ui';

import { useRollDirection } from './docs-toc-dropdown-heading.hooks';
import { selectTopmostHeading } from './docs-toc-dropdown-heading.utils';

interface DocsTocDropdownHeadingProps {
  fallback: ReactNode;
}

export function DocsTocDropdownHeading({ fallback }: DocsTocDropdownHeadingProps): ReactElement {
  const { heading, position } = useTocSelector(selectTopmostHeading);
  const roll = useRollDirection(position);

  return (
    <span className='flex min-w-0 flex-1 overflow-hidden'>
      <span
        className='motion-safe:animate-fd-roll-in'
        data-toc-text=''
        key={heading?.url}
        style={{
          '--fd-roll': roll,
        }}
      >
        {heading === undefined ? fallback : heading.title}
      </span>
    </span>
  );
}
