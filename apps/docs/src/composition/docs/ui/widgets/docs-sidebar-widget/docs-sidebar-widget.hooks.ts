import { use, useLayoutEffect } from 'react';

import { useSidebar } from '#/libs/ui';

import { DocsFrameContext, DocsLocationContext } from '../../../app/providers';

export function useSidebarOnFrame(): void {
  const { collapsed, setCollapsed } = useSidebar();
  const { path } = use(DocsLocationContext);
  const frame = use(DocsFrameContext);

  // biome-ignore lint/correctness/useExhaustiveDependencies: each new page runs it again, so on a narrow screen, where the open sidebar pushes the page out of view, the sidebar closes over the page it opened
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
    if (frame === undefined) {
      return;
    }

    if (collapsed) {
      frame.markSidebarCollapsed();
    } else {
      frame.markSidebarOpen();
    }
  }, [
    collapsed,
    frame,
  ]);
}
