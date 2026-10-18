import type { ReactElement } from 'react';
import { use } from 'react';

import { useVersions } from '#/features/versions';

import { DocsLocationContext } from '../../../app/providers';
import { DocsVersionMenu } from '../../components/docs-version-menu';

/** the version menu with the releases it reads */
export function DocsVersionWidget(): ReactElement {
  const { href } = use(DocsLocationContext);

  return (
    <DocsVersionMenu
      current={import.meta.env.VITE_CONSTITUTION_VERSION}
      href={href}
      releases={useVersions()}
    />
  );
}
