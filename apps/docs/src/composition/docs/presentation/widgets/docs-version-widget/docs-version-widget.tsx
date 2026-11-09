import type { ReactElement } from 'react';
import { use } from 'react';

import { useGetVersions, VersionsStatus } from '#/features/versions';

import { DocsVersionMenu, DocsVersionNotice } from '../../components';
import { DocsBuiltVersionContext, DocsLocationContext } from '../../providers';

export function DocsVersionWidget(): ReactElement | null {
  const { href } = use(DocsLocationContext);
  const currentVersion = use(DocsBuiltVersionContext);
  const versionsState = useGetVersions();

  if (currentVersion === undefined) {
    return null;
  }

  return (
    <>
      <DocsVersionMenu
        currentVersion={currentVersion}
        pageHref={href}
        versionsState={versionsState}
      />
      {versionsState.status === VersionsStatus.Loaded &&
        versionsState.latest !== currentVersion && (
          <DocsVersionNotice
            latestVersion={versionsState.latest}
            pageHref={href}
          />
        )}
    </>
  );
}
