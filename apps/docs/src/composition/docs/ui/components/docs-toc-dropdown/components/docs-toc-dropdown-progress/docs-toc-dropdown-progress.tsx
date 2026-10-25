import type { ReactElement } from 'react';

import { useTocSelector } from '#/libs/ui';

import { circumference, PROGRESS_RING } from './docs-toc-dropdown-progress.constants';
import { selectReadShare } from './docs-toc-dropdown-progress.utils';

export function DocsTocDropdownProgress(): ReactElement {
  const readShare = useTocSelector(selectReadShare);

  return (
    <svg
      aria-label='Reading progress'
      aria-valuemax={1}
      aria-valuemin={0}
      aria-valuenow={readShare}
      className='size-icon-md shrink-0 stroke-(length:--stroke-icon)'
      role='progressbar'
      viewBox='0 0 16 16'
    >
      <circle
        {...PROGRESS_RING}
        className='stroke-current/25'
      />
      <circle
        {...PROGRESS_RING}
        className='transition-(--toc-fill-property) duration-(--duration-base) ease-(--ease-out)'
        stroke='currentColor'
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - readShare)}
        strokeLinecap='round'
        // Stryker disable next-line ObjectLiteral: only the ring's offset transitions, a choice of design a spec could only restate
        style={{
          // Stryker disable next-line StringLiteral: as above
          '--toc-fill-property': 'stroke-dashoffset',
        }}
        transform='rotate(-90 8 8)'
      />
    </svg>
  );
}
