import type { ComponentProps, ReactElement } from 'react';

import { TOCItem } from 'fumadocs-core/toc';
import { TOCScrollArea } from 'fumadocs-ui/components/toc';
import { TOCProvider } from 'fumadocs-ui/layouts/spacious/page/slots/toc';

type TocProps = ComponentProps<typeof TOCProvider>;

function TocRoot(props: TocProps): ReactElement {
  return <TOCProvider {...props} />;
}

const Toc: typeof TocRoot & {
  Item: typeof TOCItem;
  ScrollArea: typeof TOCScrollArea;
} = Object.assign(TocRoot, {
  Item: TOCItem,
  ScrollArea: TOCScrollArea,
});

export type { TocProps };
export { Toc };
