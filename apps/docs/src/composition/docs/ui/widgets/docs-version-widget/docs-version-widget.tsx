import type { ReactElement } from 'react';
import { use } from 'react';

import { useGetVersions } from '#/features/versions';

import { DocsBuiltVersionContext, DocsLocationContext } from '../../../app/providers';
import { DocsVersionMenu } from '../../components/docs-version-menu';

export function DocsVersionWidget(): ReactElement | null {
  const { href } = use(DocsLocationContext);
  const currentVersion = use(DocsBuiltVersionContext);
  const versionsState = useGetVersions();

  if (currentVersion === undefined) {
    return null;
  }

  return (
    <DocsVersionMenu
      currentVersion={currentVersion}
      pageHref={href}
      versionsState={versionsState}
    />
  );
}
