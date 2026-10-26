import type { ReactElement } from 'react';

import { Popover as BasePopover } from '@base-ui/react/popover';

import { PopoverPanel, PopoverTrigger } from './components';
import type { PopoverProps } from './popover.types';

function PopoverRoot({ children, defaultOpen, onOpenChange, open }: PopoverProps): ReactElement {
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

const Popover: typeof PopoverRoot & {
  Panel: typeof PopoverPanel;
  Trigger: typeof PopoverTrigger;
} = Object.assign(PopoverRoot, {
  Panel: PopoverPanel,
  Trigger: PopoverTrigger,
});

export { Popover };
