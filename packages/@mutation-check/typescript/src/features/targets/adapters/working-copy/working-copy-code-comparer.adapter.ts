import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { AbsolutePath } from '#/kernel/value-objects';
import { hasCodeChanged } from '#/libs/transpiler';

import type { CodeComparer } from '../../domain/contracts';

interface WorkingCopyCodeComparerInput {
  readonly unitFolderPath: AbsolutePath;
}

const workingCopyCodeComparer = (input: WorkingCopyCodeComparerInput): CodeComparer => ({
  hasCodeChanged: (filePath, baseText) =>
    hasCodeChanged({
      // Stryker disable next-line StringLiteral: Bun's transpiler reads bytes as UTF-8 when no encoding is named
      after: readFileSync(join(input.unitFolderPath, filePath), 'utf8'),
      // Stryker disable next-line ConditionalExpression: a base left out and one read as undefined compare alike
      ...(baseText === undefined
        ? {}
        : {
            before: baseText,
          }),
      filePath,
    }),
});

export { workingCopyCodeComparer };
