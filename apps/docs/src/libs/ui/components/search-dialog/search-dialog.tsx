import type { ComponentProps, ReactElement } from 'react';

import {
  SearchDialog as FumadocsSearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
} from 'fumadocs-ui/components/dialog/search';

type SearchDialogProps = ComponentProps<typeof FumadocsSearchDialog>;

function SearchDialogRoot(props: SearchDialogProps): ReactElement {
  return <FumadocsSearchDialog {...props} />;
}

const SearchDialog: typeof SearchDialogRoot & {
  Close: typeof SearchDialogClose;
  Content: typeof SearchDialogContent;
  Header: typeof SearchDialogHeader;
  Icon: typeof SearchDialogIcon;
  Input: typeof SearchDialogInput;
  List: typeof SearchDialogList;
  Overlay: typeof SearchDialogOverlay;
} = Object.assign(SearchDialogRoot, {
  Close: SearchDialogClose,
  Content: SearchDialogContent,
  Header: SearchDialogHeader,
  Icon: SearchDialogIcon,
  Input: SearchDialogInput,
  List: SearchDialogList,
  Overlay: SearchDialogOverlay,
});

export type { SearchDialogProps };
export { SearchDialog };
