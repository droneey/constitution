import { describe, expect, it } from 'bun:test';

import type { AbsolutePath } from '#/kernel/value-objects';

import type { DistributionSources } from '../domain/contracts';

/** A release whose distribution packs these files, each from a package that builds it or not. */
interface DistributionWorld {
  readonly built: readonly string[];
  readonly unbuilt: readonly string[];
}

interface DistributionSourcesSuiteInput {
  readonly name: string;
  /** the sources over a release that holds the world, and the release's folder */
  readonly sourcesOf: (world: DistributionWorld) => {
    readonly releaseFolderPath: AbsolutePath;
    readonly sources: DistributionSources;
  };
}

const runDistributionSourcesSuite = (input: DistributionSourcesSuiteInput): void => {
  describe(`${input.name}: the DistributionSources contract`, () => {
    it('should give each file the distribution packs from a package that builds it', () => {
      // Arrange
      const { releaseFolderPath, sources } = input.sourcesOf({
        built: [
          'tools/a.js',
          'tools/b.js',
        ],
        unbuilt: [
          'tools/c.js',
        ],
      });

      // Act
      const built = sources.builtFilesOf(releaseFolderPath);

      // Assert
      expect(built).toStrictEqual(
        new Set([
          'tools/a.js',
          'tools/b.js',
        ]),
      );
    });

    it('should give no file when the distribution packs none', () => {
      // Arrange
      const { releaseFolderPath, sources } = input.sourcesOf({
        built: [],
        unbuilt: [],
      });

      // Act
      const built = sources.builtFilesOf(releaseFolderPath);

      // Assert
      expect(built).toStrictEqual(new Set());
    });
  });
};

export { runDistributionSourcesSuite };
