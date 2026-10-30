import { readFileSync } from 'node:fs';

import { parse } from 'yaml';

import { RepositoryPath } from '../../../domain/value-objects';
import { fileValueOf } from './file-value.adapter';
import { brandModel } from './models';
import { inRepository } from './repository.adapter';

const brandFilePath = RepositoryPath.create('brand.yaml');

/** @throws {SourceError} when the brand holds no tagline */
const taglineOf = (): string =>
  fileValueOf({
    model: brandModel,
    parseYamlOrJson: () => parse(readFileSync(inRepository(brandFilePath), 'utf8')),
    filePath: brandFilePath,
  }).tagline;

export { taglineOf };
