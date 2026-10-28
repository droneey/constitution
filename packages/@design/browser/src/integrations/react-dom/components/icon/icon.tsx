import type { ComponentPropsWithRef, ReactElement } from 'react';

import type { IconName } from '../../icons';
import { iconGlyphs } from '../../icons';

interface IconProps
  extends Omit<ComponentPropsWithRef<'svg'>, 'aria-hidden' | 'aria-label' | 'children' | 'role'> {
  /** without it the icon is hidden from assistive technology */
  readonly label?: string;
  readonly name: IconName;
}

function Icon({ label, name, ...props }: IconProps): ReactElement {
  const Glyph = iconGlyphs[name];

  return (
    <Glyph
      {...(label === undefined
        ? // Stryker disable next-line ObjectLiteral: lucide hides an unlabelled icon itself; the adapter hides it whatever pack draws it
          {
            'aria-hidden': true,
          }
        : {
            'aria-label': label,
            role: 'img',
          })}
      data-icon=''
      {...props}
    />
  );
}

export type { IconProps };
export { Icon };
