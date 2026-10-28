import type { ReactElement } from 'react';

import type { Version } from '#/features/versions';
import { Versions } from '#/features/versions';

interface DocsVersionNoticeProps {
  latestVersion: Version;
  pageHref: string;
}

export function DocsVersionNotice({
  latestVersion,
  pageHref,
}: DocsVersionNoticeProps): ReactElement {
  return (
    <p className='flex flex-wrap gap-x-xs px-xs font-body text-body-xs text-fd-muted-foreground'>
      Not the latest release.
      <a
        className='text-fd-primary underline'
        href={Versions.pageAddressIn({
          pageHref,
          version: latestVersion,
        })}
      >
        Read v{latestVersion}
      </a>
    </p>
  );
}
