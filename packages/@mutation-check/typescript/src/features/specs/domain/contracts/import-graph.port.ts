import type { UnitRelativePath } from '#/kernel/value-objects';

interface ImportGraph {
  /** the files of the unit the file imports itself */
  readonly importsOf: (filePath: UnitRelativePath) => readonly UnitRelativePath[];
}

export type { ImportGraph };
