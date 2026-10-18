import type { ReactElement } from 'react';

import type { SharedProps } from '#/libs/ui';
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  useStaticSearch,
} from '#/libs/ui';

/** the search dialog over the index the site prerenders */
export function DocsSearchWidget(props: SharedProps): ReactElement {
  const search = useStaticSearch({});

  return (
    <SearchDialog
      {...search}
      {...props}
    >
      <SearchDialogOverlay className='data-open:animate-none data-closed:animate-none' />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList />
      </SearchDialogContent>
    </SearchDialog>
  );
}
