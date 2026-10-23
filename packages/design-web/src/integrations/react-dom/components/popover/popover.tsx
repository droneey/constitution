import type { ReactElement } from 'react';

import { Popover as BasePopover } from '@base-ui/react/popover';

import { PopoverWidth } from './popover.constants';
import type { PopoverPanelProps, PopoverProps, PopoverTriggerProps } from './popover.types';

function Popover({ children, defaultOpen, onOpenChange, open }: PopoverProps): ReactElement {
  return (
    <BasePopover.Root
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      open={open}
    >
      {children}
    </BasePopover.Root>
  );
}

function PopoverTrigger(props: PopoverTriggerProps): ReactElement {
  return <BasePopover.Trigger {...props} />;
}

function PopoverPanel({
  align,
  collisionAvoidance,
  positionMethod,
  sideOffset,
  width = PopoverWidth.Content,
  ...props
}: PopoverPanelProps): ReactElement {
  return (
    <BasePopover.Portal>
      <BasePopover.Positioner
        align={align}
        collisionAvoidance={collisionAvoidance}
        data-popover-positioner=''
        positionMethod={positionMethod}
        sideOffset={sideOffset}
      >
        <BasePopover.Popup
          data-popover-panel=''
          data-width={width}
          {...props}
        />
      </BasePopover.Positioner>
    </BasePopover.Portal>
  );
}

export { Popover, PopoverPanel, PopoverTrigger };
