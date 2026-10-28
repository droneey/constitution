import type { UnitRelativePath } from '#/kernel/value-objects';

interface UnitSpecs {
  readonly specPaths: readonly UnitRelativePath[];
  // Why: the nearest spec first, since a spec that imports a file directly kills its mutants
  // soonest.
  readonly specPathsByFilePath: ReadonlyMap<UnitRelativePath, readonly UnitRelativePath[]>;
}

export type { UnitSpecs };
