import type { UnitRelativePath } from '#/kernel/value-objects';

interface ImportGraph {
  readonly directImportsOf: (filePath: UnitRelativePath) => readonly UnitRelativePath[];
}

export type { ImportGraph };
