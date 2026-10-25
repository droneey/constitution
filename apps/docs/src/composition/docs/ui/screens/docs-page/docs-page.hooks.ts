import { useState } from 'react';

export function useHasNavigated(path: string): boolean {
  const [shown, setShown] = useState({
    hasNavigated: false,
    path,
  });

  if (shown.path !== path) {
    setShown({
      hasNavigated: true,
      path,
    });
  }

  return shown.hasNavigated;
}
