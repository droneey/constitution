import type { ReactElement } from 'react';

import { Icon, IconName } from '@droneey/design-browser/react-dom';

import { useTocItems } from '#/libs/ui';

import { ON_THIS_PAGE_LABEL } from '../../constants';
import { DocsTocList } from '../docs-toc-list';

export function DocsToc(): ReactElement | undefined {
  const headings = useTocItems();

  if (headings.length === 0) {
    return;
  }

  return (
    // biome-ignore lint/correctness/useUniqueElementIds: the library's id for its TOC column, which this column replaces in its slot and the site's layout styles by
    <div
      className='invisible sticky top-0 flex h-full w-0 shrink-0 flex-col overflow-clip ps-0 @5xl:visible @5xl:w-(--fd-toc-width)'
      id='nd-toc'
    >
      <h3 className='inline-flex items-center font-label text-fd-muted-foreground text-label-sm'>
        <Icon name={IconName.Page} />
        {ON_THIS_PAGE_LABEL}
      </h3>
      <DocsTocList />
    </div>
  );
}
