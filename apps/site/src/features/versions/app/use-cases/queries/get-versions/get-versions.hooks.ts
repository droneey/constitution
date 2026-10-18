import { use, useEffect, useState } from 'react';

import type { Versions } from '../../../../domain/entities';
import { GetVersionsContext } from '../../../providers';

/** the releases as they load: none yet, unreadable, or read */
export type Releases =
  | {
      status: 'loading';
    }
  | {
      status: 'failed';
    }
  | ({
      status: 'loaded';
    } & Versions);

/** the releases this site knows of, read once the caller mounts */
export function useVersions(): Releases {
  const getVersions = use(GetVersionsContext);
  const [releases, setReleases] = useState<Releases>({
    status: 'loading',
  });

  useEffect(() => {
    if (getVersions === undefined) {
      return;
    }
    const controller = new AbortController();

    getVersions(controller.signal)
      .then((versions) =>
        setReleases({
          status: 'loaded',
          ...versions,
        }),
      )
      .catch(() => {
        if (!controller.signal.aborted) {
          setReleases({
            status: 'failed',
          });
        }
      });

    return (): void => controller.abort();
  }, [
    getVersions,
  ]);

  return releases;
}
