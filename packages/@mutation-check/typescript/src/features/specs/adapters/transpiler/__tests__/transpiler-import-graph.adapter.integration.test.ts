import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { afterAll } from 'bun:test';

import { AbsolutePath } from '#/kernel/value-objects';

import { IMPORT_SCENARIO, importGraphSuite } from '../../../__tests__/import-graph.suite.ts';
import { transpilerImportGraph } from '../transpiler-import-graph.adapter.ts';

const unitFolderPath = AbsolutePath.create(
  realpathSync(mkdtempSync(join(tmpdir(), 'mutation-check-import-graph-'))),
);

for (const [filePath, text] of Object.entries(IMPORT_SCENARIO)) {
  mkdirSync(dirname(join(unitFolderPath, filePath)), {
    recursive: true,
  });
  writeFileSync(join(unitFolderPath, filePath), text);
}

afterAll(() => {
  rmSync(unitFolderPath, {
    force: true,
    recursive: true,
  });
});

importGraphSuite({
  graphOfScenario: () => transpilerImportGraph(unitFolderPath),
  implementationName: 'transpilerImportGraph',
});
