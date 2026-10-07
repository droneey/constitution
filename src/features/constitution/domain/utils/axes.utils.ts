import { Axis } from '#/kernel/constants';

const BASE = 'the base';

// The base has no folder: its files sit at the root of a block or a preset.
const axisFolderOf = (axis: Axis): string => (axis === Axis.Foundation ? '' : `${axis}/`);

const axisNameOf = (axis: Axis): string => (axis === Axis.Foundation ? BASE : axis);

export { axisFolderOf, axisNameOf };
