import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { afterAll } from 'bun:test';

import type { UnitRelativePath } from '#/kernel/value-objects';
import { AbsolutePath } from '#/kernel/value-objects';

import { codeComparerSuite } from '../../../__tests__/code-comparer.suite.ts';
import type { CodeComparer } from '../../../domain/contracts';
import { workingCopyCodeComparer } from '../working-copy-code-comparer.adapter.ts';

const outerFolderPath = realpathSync(mkdtempSync(join(tmpdir(), 'mutation-check-working-copy-')));

afterAll(() => {
  rmSync(outerFolderPath, {
    force: true,
    recursive: true,
  });
});

const comparerHolding = (currentTexts: ReadonlyMap<UnitRelativePath, string>): CodeComparer => {
  const unitFolderPath = AbsolutePath.create(mkdtempSync(join(outerFolderPath, 'unit-')));

  for (const [filePath, text] of currentTexts) {
    mkdirSync(dirname(join(unitFolderPath, filePath)), {
      recursive: true,
    });
    writeFileSync(join(unitFolderPath, filePath), text);
  }

  return workingCopyCodeComparer({
    unitFolderPath,
  });
};

codeComparerSuite({
  comparerHolding,
  implementationName: 'workingCopyCodeComparer',
});
