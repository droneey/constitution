import type { ReactElement } from 'react';

import { useSearchPages } from '#/features/content';
import type { SearchDialogSlotProps } from '#/libs/ui';
import { SearchDialog } from '#/libs/ui';

export function DocsSearchWidget(props: SearchDialogSlotProps): ReactElement {
  const search = useSearchPages();

  return (
    <SearchDialog
      {...search}
      {...props}
    >
      <SearchDialog.Overlay className='data-open:animate-none data-closed:animate-none' />
      <SearchDialog.Content>
        <SearchDialog.Header>
          <SearchDialog.Icon />
          <SearchDialog.Input />
          <SearchDialog.Close />
        </SearchDialog.Header>
        <SearchDialog.List />
      </SearchDialog.Content>
    </SearchDialog>
  );
}
