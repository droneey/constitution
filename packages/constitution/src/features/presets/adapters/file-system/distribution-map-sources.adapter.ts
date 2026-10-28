import { readFileSync } from 'node:fs';

import { parse, TomlError } from 'smol-toml';

import { attempted, isSyntaxError } from '#/kernel/utils';
import { AbsolutePath } from '#/kernel/value-objects';
import { isSystemError } from '#/libs/system-error';

import type { DistributionSources } from '../../domain/contracts';
import { distributionMapModel } from './models';

interface BuildDeclaration {
  readonly keys: readonly string[];
  readonly manifestName: string;
}

interface DistributionMapSourcesInput {
  readonly builds: readonly BuildDeclaration[];
  /** in the release's folder */
  readonly mapName: string;
}

const TOML_EXTENSION = '.toml';

// A file that is missing, unreadable or does not parse reads as nothing; a manifest of TOML is read
// as TOML, any other as JSON.
const readOf = (filePath: AbsolutePath): unknown =>
  attempted({
    effect: (): unknown => {
      // Stryker disable next-line StringLiteral: a parser reads the bytes of a file as its text
      const text = readFileSync(filePath, 'utf8');

      return filePath.endsWith(TOML_EXTENSION) ? parse(text) : JSON.parse(text);
    },
    isRecognised: (error: unknown): error is NodeJS.ErrnoException | SyntaxError | TomlError =>
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

const isBuilt = (input: {
  builds: readonly BuildDeclaration[];
  packageFolderPath: AbsolutePath;
}): boolean =>
  input.builds.some(
    (build) =>
      heldAt(readOf(AbsolutePath.join(input.packageFolderPath, build.manifestName)), build.keys) !==
      undefined,
  );

/** A map that is missing, unreadable or of another shape packs nothing. */
const createDistributionMapSources = (input: DistributionMapSourcesInput): DistributionSources => ({
  builtFilesOf: (releaseFolderPath: AbsolutePath): ReadonlySet<string> => {
    const read = distributionMapModel.safeParse(
      readOf(AbsolutePath.join(releaseFolderPath, input.mapName)),
    );

    return new Set(
      Object.entries(read.success ? read.data : {})
        .filter(([, entry]) =>
          isBuilt({
            builds: input.builds,
            packageFolderPath: AbsolutePath.join(releaseFolderPath, entry.package),
          }),
        )
        .map(([file]) => file),
    );
  },
});

export { createDistributionMapSources };
