import type { ReactElement } from 'react';

import { Icon, IconName, Popover, PopoverWidth } from '@droneey/design-browser/react-dom';

import type { Version, VersionsState } from '#/features/versions';
import { Versions, VersionsStatus } from '#/features/versions';

import { POPOVER_OFFSET_PX } from '../../constants';

interface DocsVersionMenuProps {
  currentVersion: Version;
  pageHref: string;
  versionsState: VersionsState;
}

const onlyCurrentVersion = (
  currentVersion: Version,
): {
  readonly latest?: Version;
  readonly versions: readonly Version[];
} => ({
  versions: [
    currentVersion,
  ],
});

export function DocsVersionMenu({
  currentVersion,
  pageHref,
  versionsState,
}: DocsVersionMenuProps): ReactElement {
  const { latest, versions } =
    versionsState.status === VersionsStatus.Loaded
      ? versionsState
      : onlyCurrentVersion(currentVersion);

  return (
    <Popover>
      <Popover.Trigger
        className='text-fd-foreground'
        data-sidebar-field=''
      >
        <Icon
          className='text-fd-muted-foreground'
          name={IconName.Version}
        />
        <span className='font-medium'>v{currentVersion}</span>
        {currentVersion === latest && <span className='text-xs text-fd-primary'>latest</span>}
        <Icon
          className='ms-auto text-fd-muted-foreground'
          name={IconName.Switch}
        />
      </Popover.Trigger>
      <Popover.Panel
        align='start'
        // Stryker disable next-line ObjectLiteral: the axis matters only when the popup would overflow the viewport, which a document without layout never reports
        collisionAvoidance={{
          // Stryker disable next-line StringLiteral: as above
          fallbackAxisSide: 'none',
        }}
        sideOffset={POPOVER_OFFSET_PX}
        width={PopoverWidth.Anchor}
      >
        <nav aria-label='Versions'>
          <ul>
            {versions.map((version) => (
              <li key={version}>
                <a
                  aria-current={version === currentVersion ? 'page' : undefined}
                  className='flex h-control-md items-center gap-xs rounded-lg px-xs'
                  href={Versions.pageAddressIn({
                    latest: latest ?? currentVersion,
                    path: pageHref,
                    version,
                  })}
                >
                  <span>v{version}</span>
                  {version === latest && (
                    <span className='text-xs text-fd-muted-foreground'>latest</span>
                  )}
                  {version === currentVersion && (
                    <Icon
                      className='ms-auto text-fd-primary'
                      name={IconName.Selected}
                    />
                  )}
                </a>
              </li>
            ))}
          </ul>
          {versionsState.status === VersionsStatus.Loading && (
            <p className='flex h-control-md items-center px-xs text-fd-muted-foreground'>
              Loading versions…
            </p>
          )}
          {versionsState.status === VersionsStatus.Failed && (
            <p className='flex h-control-md items-center px-xs text-fd-muted-foreground'>
              Versions unavailable
            </p>
          )}
        </nav>
      </Popover.Panel>
    </Popover>
  );
}
