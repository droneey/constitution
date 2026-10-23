import type { ReactElement } from 'react';

import {
  Icon,
  IconName,
  Popover,
  PopoverPanel,
  PopoverTrigger,
  PopoverWidth,
} from '@droneey/design-web/react-dom';

import type { Releases } from '#/features/versions';
import { addressIn } from '#/features/versions';

interface DocsVersionMenuProps {
  current: string;
  href: string;
  releases: Releases;
}

/** until the releases load, it lists only the one the page belongs to */
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
    <Popover>
      <PopoverTrigger
        className='text-fd-foreground'
        data-sidebar-field=''
      >
        <Icon
          className='text-fd-muted-foreground'
          name={IconName.Version}
        />
        <span className='font-medium'>v{current}</span>
        {current === latest && <span className='text-xs text-fd-primary'>latest</span>}
        <Icon
          className='ms-auto text-fd-muted-foreground'
          name={IconName.Switch}
        />
      </PopoverTrigger>
      <PopoverPanel
        align='start'
        // Stryker disable ObjectLiteral,StringLiteral: the axis matters only when the popup would overflow the viewport, which a document without layout never reports
        collisionAvoidance={{
          fallbackAxisSide: 'none',
        }}
        // Stryker restore ObjectLiteral,StringLiteral
        sideOffset={8}
        width={PopoverWidth.Anchor}
      >
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
                    <Icon
                      className='ms-auto text-fd-primary'
                      name={IconName.Selected}
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
      </PopoverPanel>
    </Popover>
  );
}
