import type { ReactElement } from 'react';
import { use } from 'react';

import { useGetVersions, VersionsStatus } from '#/features/versions';

import { DocsBuiltVersionContext, DocsLocationContext } from '../../../app/providers';
import { DocsVersionMenu, DocsVersionNotice } from '../../components';

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
