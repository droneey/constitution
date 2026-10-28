import type { UnitRelativePath } from '#/kernel/value-objects';

/** The specs of the unit, and for each file the specs that load it, the nearest first. */
interface UnitSpecs {
  readonly specPaths: readonly UnitRelativePath[];
  readonly specPathsByFilePath: ReadonlyMap<UnitRelativePath, readonly UnitRelativePath[]>;
}

export type { UnitSpecs };
