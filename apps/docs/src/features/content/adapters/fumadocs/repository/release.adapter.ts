import { readFileSync } from 'node:fs';

import { manifestModel } from './models';
import { inRepository } from './repository.adapter';

const releaseOf = (): string =>
  manifestModel.parse(
    // Stryker disable next-line StringLiteral: JSON.parse reads a buffer as its text, so the file parses with no encoding named
    JSON.parse(readFileSync(inRepository('packages/constitution/package.json'), 'utf8')),
  ).version;

export { releaseOf };
