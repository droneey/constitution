import { readFileSync } from 'node:fs';

import { parse, TomlError } from 'smol-toml';

import { attempted, isSyntaxError } from '#/kernel/utils';
import { isSystemError } from '#/libs/system-error';

import type { DistributionSources } from '../../domain/contracts';
import { distributionMapModel } from './models';

/** Where a package declares its build: a manifest by its name, and the keys to the build in it. */
interface BuildDeclaration {
  readonly keys: readonly string[];
  readonly manifest: string;
}

interface DistributionMapSourcesInput {
  readonly builds: readonly BuildDeclaration[];
  /** the name of the distribution's map in its folder */
  readonly map: string;
}

const SEPARATOR = '/';
const TOML_EXTENSION = '.toml';

// A file that is missing, unreadable or does not parse reads as nothing; a manifest of TOML is read
// as TOML, any other as JSON.
const readOf = (path: string): unknown =>
  attempted<unknown>({
    effect: () => {
      // Stryker disable next-line StringLiteral: a parser reads the bytes of a file as its text
      const text = readFileSync(path, 'utf8');

      return path.endsWith(TOML_EXTENSION) ? parse(text) : JSON.parse(text);
    },
    isRecognised: (error: unknown): boolean =>
      // Stryker disable next-line ConditionalExpression,LogicalOperator: reading a file and parsing its text throw no other error
      isSystemError(error) || isSyntaxError(error) || error instanceof TomlError,
  });

const heldAt = (read: unknown, keys: readonly string[]): unknown =>
  keys.reduce<unknown>(
    (held, key) =>
      // Stryker disable next-line ConditionalExpression: the test only narrows the type
      typeof held === 'object' && held !== null
        ? Object.entries(held).find(([name]) => name === key)?.[1]
        : undefined,
    read,
  );

const isBuilt = (input: { builds: readonly BuildDeclaration[]; folder: string }): boolean =>
  input.builds.some(
    (build) =>
      heldAt(readOf(`${input.folder}${SEPARATOR}${build.manifest}`), build.keys) !== undefined,
  );

/** A map that is missing, unreadable or of another shape packs nothing. */
const createDistributionMapSources = (input: DistributionMapSourcesInput): DistributionSources => ({
  packagesOf: (folder: string): ReadonlyMap<string, string> => {
    const read = distributionMapModel.safeParse(readOf(`${folder}${SEPARATOR}${input.map}`));

    return new Map(
      Object.entries(read.success ? read.data : {})
        .filter(([, entry]) =>
          isBuilt({
            builds: input.builds,
            folder: `${folder}${SEPARATOR}${entry.package}`,
          }),
        )
        .map(([file, entry]) => [
          file,
          entry.package,
        ]),
    );
  },
});

export { createDistributionMapSources };
