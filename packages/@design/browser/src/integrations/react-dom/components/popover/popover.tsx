import type { ReactElement, ReactNode } from 'react';

import { Popover as BasePopover } from '@base-ui/react/popover';

import { PopoverPanel, PopoverTrigger } from './components';

interface PopoverProps {
  readonly children: ReactNode;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly open?: boolean;
}

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

export type { PopoverProps };
export { Popover };
