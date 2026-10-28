import type { ReactElement } from 'react';
import { useState } from 'react';

import { Icon, IconName, Popover, PopoverWidth } from '@droneey/design-browser/react-dom';

import { ON_THIS_PAGE_LABEL, POPOVER_OFFSET_PX } from '../../constants';
import { DocsTocList } from '../docs-toc-list';
import { DocsTocDropdownHeading, DocsTocDropdownProgress } from './components';

export function DocsTocDropdown(): ReactElement {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover
      onOpenChange={setIsOpen}
      open={isOpen}
    >
      <Popover.Trigger className='flex min-w-0 items-center rounded-lg text-start font-label text-fd-muted-foreground text-label-sm transition-colors duration-(--duration-fast) ease-(--ease-standard) hover:bg-fd-accent hover:text-fd-accent-foreground data-popup-open:bg-fd-accent data-popup-open:text-fd-accent-foreground'>
        <DocsTocDropdownProgress />
        <DocsTocDropdownHeading fallback={ON_THIS_PAGE_LABEL} />
        <Icon
          className='transition-transform duration-(--duration-base) ease-(--ease-out) in-data-popup-open:rotate-180'
          name={IconName.Expand}
        />
      </Popover.Trigger>
      <Popover.Panel
        align='start'
        // Stryker disable next-line ObjectLiteral: the popup stays on its trigger's edge and side only when it would overflow the viewport, which a document without layout never reports
        collisionAvoidance={{
          // Stryker disable next-line StringLiteral: as above
          align: 'none',
          // Stryker disable next-line StringLiteral: as above
          fallbackAxisSide: 'none',
        }}
        data-toc-dropdown=''
        positionMethod='fixed'
        sideOffset={POPOVER_OFFSET_PX}
        width={PopoverWidth.Available}
      >
        <DocsTocList onSelect={(): void => setIsOpen(false)} />
      </Popover.Panel>
    </Popover>
  );
}
