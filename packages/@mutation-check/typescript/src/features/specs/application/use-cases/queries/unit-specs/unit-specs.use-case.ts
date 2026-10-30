import type { UnitRelativePath } from '#/kernel/value-objects';

import type { ImportEdges } from '../../../../domain/entities';
import { UnitSpecs } from '../../../../domain/entities';
import type { ImportGraph, SpecRunner } from '../../../contracts';

interface UnitSpecsInput {
  readonly importGraph: ImportGraph;
  readonly specRunner: SpecRunner;
}

const importEdgesFrom = (input: {
  importGraph: ImportGraph;
  specPaths: readonly UnitRelativePath[];
}): ImportEdges => {
  const edges = new Map<UnitRelativePath, readonly UnitRelativePath[]>();
  let layer = input.specPaths;

  while (layer.length > 0) {
    const next: UnitRelativePath[] = [];

    for (const filePath of layer) {
      if (!edges.has(filePath)) {
        const importedPaths = input.importGraph.directImportsOf(filePath);

        edges.set(filePath, importedPaths);
        next.push(...importedPaths);
      }
    }

    layer = next;
  }

  return edges;
};

/**
 * @throws {SpecSettingsError} when the configuration of the specs is not of the shape their
 * runner reads
 */
const unitSpecs = (input: UnitSpecsInput): UnitSpecs => {
  const specPaths = input.specRunner.findSpecPaths();

  return UnitSpecs.create({
    edges: importEdgesFrom({
      importGraph: input.importGraph,
      specPaths,
    }),
    specPaths,
  });
};

export type { UnitSpecsInput };
export { unitSpecs };
