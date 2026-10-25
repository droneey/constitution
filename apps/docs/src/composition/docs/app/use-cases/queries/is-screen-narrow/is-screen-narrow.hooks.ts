import { use, useEffectEvent, useLayoutEffect } from 'react';

import { IsScreenNarrowContext } from './is-screen-narrow.context';

interface CollapsedOnNarrowScreenInput {
  readonly collapse: () => void;
  /** the page shown */
  readonly path: string;
}

/** on a narrow screen, where the open sidebar pushes the page out of view, the sidebar closes over each page it opens */
export function useCollapsedOnNarrowScreen({ collapse, path }: CollapsedOnNarrowScreenInput): void {
  const isScreenNarrow = use(IsScreenNarrowContext);
  const collapseOnNarrowScreen = useEffectEvent(() => {
    if (isScreenNarrow?.()) {
      collapse();
    }
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: each new page runs it again
  useLayoutEffect(() => {
    collapseOnNarrowScreen();
  }, [
    path,
  ]);
}
