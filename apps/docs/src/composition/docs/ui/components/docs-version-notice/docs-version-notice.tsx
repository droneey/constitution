import type { ReactElement } from 'react';

import type { Version } from '#/features/versions';

interface DocsVersionNoticeProps {
  latestVersion: Version;
  pageHref: string;
}

/** the link leaves the site's base, so the host leads it to the same page of the latest release */
export function DocsVersionNotice({
  latestVersion,
  pageHref,
}: DocsVersionNoticeProps): ReactElement {
  return (
    <p className='flex flex-wrap gap-x-xs px-xs font-body text-body-xs text-fd-muted-foreground'>
      Not the latest release.
      <a
        className='text-fd-primary underline'
        href={pageHref}
      >
        Read v{latestVersion}
      </a>
    </p>
  );
}
