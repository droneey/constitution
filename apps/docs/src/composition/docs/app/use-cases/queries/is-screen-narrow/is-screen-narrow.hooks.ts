import { use, useEffectEvent, useLayoutEffect } from 'react';

import { IsScreenNarrowContext } from './is-screen-narrow.context';

interface CollapsedOnNarrowScreenInput {
  readonly collapse: () => void;
  readonly pageKey: string;
}

export function useCollapsedOnNarrowScreen({
  collapse,
  pageKey,
}: CollapsedOnNarrowScreenInput): void {
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
    pageKey,
  ]);
}
