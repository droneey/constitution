import { readFileSync } from 'node:fs';

import { parse } from 'yaml';

import { brandModel } from './models';
import { inRepository } from './repository.adapter';

const taglineOf = (): string =>
  brandModel.parse(parse(readFileSync(inRepository('brand.yaml'), 'utf8'))).tagline;

export { taglineOf };
