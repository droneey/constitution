import type { ReactElement } from 'react';
import { use } from 'react';

import { useGetVersions, VersionsStatus } from '#/features/versions';

import { DocsBuiltVersionContext, DocsLocationContext } from '../../../app/providers';
import { DocsVersionMenu } from '../../components/docs-version-menu';
import { DocsVersionNotice } from '../../components/docs-version-notice';

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
            latest={versionsState.latest}
            pageHref={href}
          />
        )}
    </>
  );
}
