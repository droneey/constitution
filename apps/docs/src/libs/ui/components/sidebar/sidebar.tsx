import type { ComponentProps, ReactElement } from 'react';

import {
  Sidebar as FumadocsSidebar,
  SidebarProvider,
} from 'fumadocs-ui/layouts/spacious/slots/sidebar';

type SidebarProps = ComponentProps<typeof FumadocsSidebar>;

function SidebarRoot(props: SidebarProps): ReactElement {
  return <FumadocsSidebar {...props} />;
}

const Sidebar: typeof SidebarRoot & {
  Provider: typeof SidebarProvider;
} = Object.assign(SidebarRoot, {
  Provider: SidebarProvider,
});

export type { SidebarProps };
export { Sidebar };
