import { readFileSync } from 'node:fs';

import { parse } from 'yaml';

import { brandModel } from './models';
import { inRepository } from './repository.adapter';

/** the brand's tagline, from the repository's brand.yaml: the overview's description */
const taglineOf = (): string =>
  brandModel.parse(parse(readFileSync(inRepository('brand.yaml'), 'utf8'))).tagline;

export { taglineOf };
