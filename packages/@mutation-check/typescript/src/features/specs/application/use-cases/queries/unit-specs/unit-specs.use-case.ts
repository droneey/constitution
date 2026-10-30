import type { UnitRelativePath } from '#/kernel/value-objects';

import type { ImportGraph, SpecRunner } from '../../../contracts';
import type { UnitSpecs } from '../../../../domain/entities';

interface UnitSpecsInput {
  readonly importGraph: ImportGraph;
  readonly specRunner: SpecRunner;
}

interface LoadingSpec {
  readonly depth: number;
  readonly specPath: UnitRelativePath;
}

const importDepthsOf = (input: {
  filePath: UnitRelativePath;
  importGraph: ImportGraph;
}): ReadonlyMap<UnitRelativePath, number> => {
  const importDepths = new Map<UnitRelativePath, number>();
  let layer: readonly UnitRelativePath[] = [
    input.filePath,
  ];

  for (let depth = 1; layer.length > 0; depth += 1) {
    const next: UnitRelativePath[] = [];

    for (const filePath of layer) {
      for (const importedPath of input.importGraph.directImportsOf(filePath)) {
        if (!importDepths.has(importedPath)) {
          importDepths.set(importedPath, depth);
          next.push(importedPath);
        }
      }
    }

    layer = next;
  }

  return importDepths;
};

/**
 * @throws {SpecSettingsError} when the configuration of the specs is not of the shape their
 * runner reads
 */
const unitSpecs = (input: UnitSpecsInput): UnitSpecs => {
  const specPaths = input.specRunner.findSpecPaths();
  const loadingSpecs = new Map<UnitRelativePath, LoadingSpec[]>();

  for (const specPath of specPaths) {
    for (const [filePath, depth] of importDepthsOf({
      filePath: specPath,
      importGraph: input.importGraph,
    })) {
      loadingSpecs.set(filePath, [
        ...(loadingSpecs.get(filePath) ?? []),
        {
          depth,
          specPath,
        },
      ]);
    }
  }

  return {
    specPaths,
    specPathsByFilePath: new Map(
      [
        ...loadingSpecs,
      ].map(([filePath, fileLoadingSpecs]) => [
        filePath,
        fileLoadingSpecs
          .toSorted((left, right) => left.depth - right.depth)
          .map(({ specPath }) => specPath),
      ]),
    ),
  };
};

export type { UnitSpecsInput };
export { unitSpecs };
