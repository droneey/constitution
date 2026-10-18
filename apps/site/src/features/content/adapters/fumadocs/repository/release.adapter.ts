import { readFileSync } from 'node:fs';

import { manifestModel } from './models';
import { inRepository } from './repository.adapter';

const releaseOf = (): string =>
  manifestModel.parse(
    JSON.parse(readFileSync(inRepository('packages/constitution/package.json'), 'utf8')),
  ).version;

export { releaseOf };
