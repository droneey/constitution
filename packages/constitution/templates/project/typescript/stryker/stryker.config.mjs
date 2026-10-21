import part from '<parts>';
import { join } from '<presets>/typescript/join.mjs';

// Stryker has no extends, so the parts are joined.
export default join(
  part,
  // the project's own settings, joined after the parts
  {},
);
