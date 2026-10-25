import type { ReactElement } from 'react';

import type { Version } from '#/features/versions';

interface DocsVersionNoticeProps {
  latest: Version;
  pageHref: string;
}

/** the link leaves the site's base, so the host leads it to the same page of the latest release */
export function DocsVersionNotice({ latest, pageHref }: DocsVersionNoticeProps): ReactElement {
  return (
    <p className='flex flex-wrap gap-x-xs px-xs text-xs text-fd-muted-foreground'>
      Not the latest release.
      <a
        className='font-medium text-fd-primary underline'
        href={pageHref}
      >
        Read v{latest}
      </a>
    </p>
  );
}
