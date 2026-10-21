import * as part from '<parts>';
import { join } from '<presets>/typescript/join.mjs';

// dependency-cruiser's extends keeps the first of two rules of one name, so the parts are joined.
export default join(
  part,
  // the project's own settings, joined after the parts
  {},
);
