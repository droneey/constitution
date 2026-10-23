import type { ComponentPropsWithRef, ReactNode } from 'react';

import type { PopoverPositionerProps } from '@base-ui/react/popover';

import type { PopoverWidth } from './popover.constants';

interface PopoverProps {
  readonly children: ReactNode;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly open?: boolean;
}

type PopoverTriggerProps = ComponentPropsWithRef<'button'>;

interface PopoverPanelProps extends ComponentPropsWithRef<'div'> {
  readonly align?: PopoverPositionerProps['align'];
  readonly collisionAvoidance?: PopoverPositionerProps['collisionAvoidance'];
  readonly positionMethod?: PopoverPositionerProps['positionMethod'];
  /** in pixels, between the trigger's edge and the panel */
  readonly sideOffset?: number;
  /** the content's own by default; the trigger's, or as wide as the room between the popup's least and greatest */
  readonly width?: PopoverWidth;
}

export type { PopoverPanelProps, PopoverProps, PopoverTriggerProps };
