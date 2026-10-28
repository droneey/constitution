import { UnitRelativePath } from '#/kernel/value-objects';

import type { ImportGraph } from '../domain/contracts';

const fakeImportGraph = (
  importsByPath: Readonly<Record<string, readonly string[]>>,
): ImportGraph => ({
  directImportsOf: (filePath) => (importsByPath[filePath] ?? []).map(UnitRelativePath.create),
});

export { fakeImportGraph };
