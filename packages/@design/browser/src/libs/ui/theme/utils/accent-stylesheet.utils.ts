import { accentPropertyPrefix } from '../constants';
import type { AccentScale } from '../value-objects';

/** the app's accent scale as the steps the default theme's roles read, on the root */
const accentStylesheetOf = (scale: AccentScale): string => {
  const declarations = Object.entries(scale).map(
    ([step, colour]) => `${accentPropertyPrefix}-${step}: oklch(${colour.join(' ')});`,
  );

  return `:root {${declarations.join('')}}`;
};

export { accentStylesheetOf };
