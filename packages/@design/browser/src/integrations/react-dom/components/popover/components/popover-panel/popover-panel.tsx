import type { ComponentPropsWithRef, ReactElement } from 'react';

import type { PopoverPositionerProps } from '@base-ui/react/popover';
import { Popover as BasePopover } from '@base-ui/react/popover';

import { PopoverWidth } from '../../popover.constants';

interface PopoverPanelProps extends ComponentPropsWithRef<'div'> {
  readonly align?: PopoverPositionerProps['align'];
  readonly collisionAvoidance?: PopoverPositionerProps['collisionAvoidance'];
  readonly positionMethod?: PopoverPositionerProps['positionMethod'];
  /** in pixels, between the trigger's edge and the panel */
  readonly sideOffset?: number;
  /** the content's own by default; the trigger's, or as wide as the room between the popup's least and greatest */
  readonly width?: PopoverWidth;
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

export type { PopoverPanelProps };
export { PopoverPanel };
