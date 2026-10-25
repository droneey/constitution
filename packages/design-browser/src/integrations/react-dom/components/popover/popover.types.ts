import type { ReactNode } from 'react';

interface PopoverProps {
  readonly children: ReactNode;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly open?: boolean;
}

export type { PopoverProps };
