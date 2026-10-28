import type { AbsolutePath } from '#/kernel/value-objects';
import { UnitRelativePath } from '#/kernel/value-objects';
import { importsOf } from '#/libs/transpiler';

import type { ImportGraph } from '../../domain/contracts';

const transpilerImportGraph = (unitFolderPath: AbsolutePath): ImportGraph => ({
  directImportsOf: (filePath) =>
    importsOf({
      filePath,
      workingFolderPath: unitFolderPath,
    }).map(UnitRelativePath.create),
});

export { transpilerImportGraph };
