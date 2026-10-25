import { use, useEffect, useState } from 'react';

import { VersionsError } from '../../../../domain/errors';
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
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        // the menu is an optional part: a defect shows it unavailable and is reported, never thrown at the page
        if (!(error instanceof VersionsError)) {
          reportError(error);
        }

        setVersionsState({
          status: VersionsStatus.Failed,
        });
      });

    return (): void => controller.abort();
  }, [
    getVersions,
  ]);

  return versionsState;
}
