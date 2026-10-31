import type { ReactElement } from 'react';

import { DocsHomeFrame } from '../../components';

export function DocsErrorScreen(): ReactElement {
  return (
    <DocsHomeFrame>
      <div className='flex flex-1 flex-col items-center justify-center gap-sm px-lg text-center'>
        <h1 className='font-heading text-heading-xl'>This page could not be shown</h1>
        <p className='text-fd-muted-foreground'>Reload it, or go back home.</p>
        <a
          className='text-fd-primary underline'
          href='/'
        >
          Back to Home
        </a>
      </div>
    </DocsHomeFrame>
  );
}
