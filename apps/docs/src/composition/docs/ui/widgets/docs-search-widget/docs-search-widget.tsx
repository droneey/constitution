import type { ReactElement } from 'react';

import type { SearchDialogSlotProps } from '#/libs/ui';
import { SearchDialog, useStaticSearch } from '#/libs/ui';

export function DocsSearchWidget(props: SearchDialogSlotProps): ReactElement {
  const search = useStaticSearch({});

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
