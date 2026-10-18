import type { ReactElement } from 'react';

import type { Releases } from '#/features/versions';
import { addressIn } from '#/features/versions';
import { Check, ChevronsUpDown, Popover, Tag } from '#/libs/ui';

interface DocsVersionMenuProps {
  /** the release this site belongs to */
  current: string;
  /** the address of the page the reader is on */
  href: string;
  releases: Releases;
}

/** the releases this site has; until they load, only the one the page belongs to */
export function DocsVersionMenu({ current, href, releases }: DocsVersionMenuProps): ReactElement {
  const { latest, versions } =
    releases.status === 'loaded'
      ? releases
      : {
          latest: undefined,
          versions: [
            current,
          ],
        };

  return (
    <Popover.Root>
      <Popover.Trigger
        className='text-fd-foreground'
        data-sidebar-field=''
      >
        <Tag
          aria-hidden
          className='text-fd-muted-foreground'
        />
        <span className='font-medium'>v{current}</span>
        {current === latest && <span className='text-xs text-fd-primary'>latest</span>}
        <ChevronsUpDown
          aria-hidden
          className='ms-auto text-fd-muted-foreground'
        />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner
          align='start'
          className='z-50'
          // Stryker disable ObjectLiteral,StringLiteral: the axis matters only when the popup would overflow the viewport, which a document without layout never reports
          collisionAvoidance={{
            fallbackAxisSide: 'none',
          }}
          // Stryker restore ObjectLiteral,StringLiteral
          sideOffset={8}
        >
          <Popover.Popup className='w-(--anchor-width) min-w-popup-min max-h-(--available-height) overflow-y-auto rounded-xl border bg-fd-popover p-2xs text-fd-popover-foreground shadow-lg origin-(--transform-origin) data-closed:animate-fd-popover-out data-open:animate-fd-popover-in'>
            <nav aria-label='Versions'>
              <ul>
                {versions.map((version) => (
                  <li key={version}>
                    <a
                      aria-current={version === current ? 'page' : undefined}
                      className='flex h-control-md items-center gap-xs rounded-lg px-xs'
                      href={addressIn({
                        latest: latest ?? current,
                        path: href,
                        version,
                      })}
                    >
                      <span>v{version}</span>
                      {version === latest && (
                        <span className='text-xs text-fd-muted-foreground'>latest</span>
                      )}
                      {version === current && (
                        <Check
                          aria-hidden
                          className='ms-auto size-icon-md text-fd-primary'
                        />
                      )}
                    </a>
                  </li>
                ))}
              </ul>
              {releases.status === 'loading' && (
                <p className='flex h-control-md items-center px-xs text-fd-muted-foreground'>
                  Loading versions…
                </p>
              )}
              {releases.status === 'failed' && (
                <p className='flex h-control-md items-center px-xs text-fd-muted-foreground'>
                  Versions unavailable
                </p>
              )}
            </nav>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
