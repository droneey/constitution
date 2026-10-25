import type { ComponentPropsWithRef } from 'react';

import type { IconName } from '../../icons';

interface IconProps
  extends Omit<ComponentPropsWithRef<'svg'>, 'aria-hidden' | 'aria-label' | 'children' | 'role'> {
  /** names what the icon means where nothing beside it does; without it the icon is hidden from assistive technology */
  readonly label?: string;
  readonly name: IconName;
}

export type { IconProps };
