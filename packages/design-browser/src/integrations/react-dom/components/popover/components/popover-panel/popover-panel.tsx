import type { ReactElement } from 'react';

import { Popover as BasePopover } from '@base-ui/react/popover';

import { PopoverWidth } from '../../popover.constants';
import type { PopoverPanelProps } from './popover-panel.types';

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

export { PopoverPanel };
