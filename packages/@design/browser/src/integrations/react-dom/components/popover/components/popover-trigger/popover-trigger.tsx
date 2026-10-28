import type { ComponentPropsWithRef, ReactElement } from 'react';

import { Popover as BasePopover } from '@base-ui/react/popover';

type PopoverTriggerProps = ComponentPropsWithRef<'button'>;

function PopoverTrigger(props: PopoverTriggerProps): ReactElement {
  return <BasePopover.Trigger {...props} />;
}

export type { PopoverTriggerProps };
export { PopoverTrigger };
