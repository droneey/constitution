import { useState } from 'react';

export function useHasNavigated(pageKey: string): boolean {
  const [shown, setShown] = useState({
    hasNavigated: false,
    pageKey,
  });

  if (shown.pageKey !== pageKey) {
    setShown({
      hasNavigated: true,
      pageKey,
    });
  }

  return shown.hasNavigated;
}
