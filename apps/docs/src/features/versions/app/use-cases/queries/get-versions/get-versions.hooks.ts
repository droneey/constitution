import { use, useEffect, useState } from 'react';

import { GetVersionsContext } from '../../../providers';
import { VersionsStatus } from './get-versions.constants';
import type { VersionsState } from './get-versions.types';

export function useGetVersions(): VersionsState {
  const getVersions = use(GetVersionsContext);
  const [versionsState, setVersionsState] = useState<VersionsState>({
    status: VersionsStatus.Loading,
  });

  useEffect(() => {
    if (getVersions === undefined) {
      return;
    }

    const controller = new AbortController();

    getVersions(controller.signal)
      .then((versions) =>
        setVersionsState({
          status: VersionsStatus.Loaded,
          ...versions,
        }),
      )
      .catch(() => {
        if (!controller.signal.aborted) {
          setVersionsState({
            status: VersionsStatus.Failed,
          });
        }
      });

    return (): void => controller.abort();
  }, [
    getVersions,
  ]);

  return versionsState;
}
