import { readFileSync } from 'node:fs';

import { RepositoryPath } from '../../../domain/source/value-objects';
import { fileValueOf } from './file-value.adapter';
import { manifestModel } from './models';
import { inRepository } from './repository.adapter';

const constitutionManifestPath = RepositoryPath.create('packages/constitution/package.json');

/** @throws {SourceError} when the Constitution's package names no release version */
const releaseOf = (): string =>
  fileValueOf({
    model: manifestModel,
    parseYamlOrJson: () =>
      // Stryker disable next-line StringLiteral: JSON.parse reads a buffer as its text, so the file parses with no encoding named
      JSON.parse(readFileSync(inRepository(constitutionManifestPath), 'utf8')),
    filePath: constitutionManifestPath,
  }).version;

export { releaseOf };
