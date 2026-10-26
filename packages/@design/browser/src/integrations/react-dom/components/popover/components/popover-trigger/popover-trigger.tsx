import type { ReactElement } from 'react';

import { Popover as BasePopover } from '@base-ui/react/popover';

import type { PopoverTriggerProps } from './popover-trigger.types';

function PopoverTrigger(props: PopoverTriggerProps): ReactElement {
  return <BasePopover.Trigger {...props} />;
}

export { PopoverTrigger };
