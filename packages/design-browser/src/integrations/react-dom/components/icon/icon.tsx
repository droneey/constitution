import type { ReactElement } from 'react';

import { iconGlyphs } from '../../icons';
import type { IconProps } from './icon.types';

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

export { Icon };
