import { use, useLayoutEffect } from 'react';

import { useSidebar } from '#/libs/ui';

import { DocsFrameContext, DocsLocationContext } from '../../../app/providers';

/**
 * The sidebar's state on the frame around the page; on a narrow screen, where the open sidebar
 * pushes the page out of view, it collapses when the site opens and after each page.
 */
export function useSidebarFrame(): void {
  const { collapsed, setCollapsed } = useSidebar();
  const { path } = use(DocsLocationContext);
  const frame = use(DocsFrameContext);

  // biome-ignore lint/correctness/useExhaustiveDependencies: each new page runs it again, so the sidebar closes over the page it opened
  useLayoutEffect(() => {
    if (frame?.isNarrow()) {
      setCollapsed(true);
    }
  }, [
    frame,
    path,
    setCollapsed,
  ]);

  useLayoutEffect(() => {
    frame?.markSidebar(collapsed);
  }, [
    collapsed,
    frame,
  ]);
}
