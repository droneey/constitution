import { ACCENT_SCALE } from '../constants';
import type { AccentTokens } from '../types';
import { isOklch, isRecord } from './guards.utils';

/** the app's accent scale as the steps the default theme's roles read, on the root */
const accentStylesheetOf = (accent: AccentTokens): string => {
  const declarations = Object.entries(accent.color.brand).flatMap(([step, token]) => {
    const colour = isRecord(token) ? token['$value'] : undefined;
    const components = isRecord(colour) ? colour['components'] : undefined;

    return isOklch(components)
      ? [
          `${ACCENT_SCALE}-${step}: oklch(${components.join(' ')});`,
        ]
      : [];
  });

  return `:root { ${declarations.join(' ')} }`;
};

export { accentStylesheetOf };
