import { accentPropertyPrefix } from '../constants';
import type { AccentScale } from '../value-objects';

const accentStylesheetOf = (scale: AccentScale): string => {
  const declarations = Object.entries(scale).map(
    ([step, colour]) => `${accentPropertyPrefix}-${step}: oklch(${colour.join(' ')});`,
  );

  return `:root {${declarations.join('')}}`;
};

export { accentStylesheetOf };
