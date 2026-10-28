import { describe, expect, it } from 'bun:test';

import { UnitRelativePath } from '#/kernel/value-objects';

import type { ImportGraph } from '../domain/contracts';

const IMPORT_SCENARIO: Readonly<Record<string, string>> = {
  'src/__tests__/order.test.ts':
    "import { order } from '../order.ts';\n\nexport const tested = order;\n",
  'src/order.ts': "import { price } from './price.ts';\n\nexport const order = price;\n",
  'src/price.ts': 'export const price = 1;\n',
} as const;

interface ImportGraphSuiteInput {
  readonly graphOfScenario: () => ImportGraph;
  readonly implementationName: string;
}

const importGraphSuite = (input: ImportGraphSuiteInput): void => {
  describe(`the ImportGraph contract, kept by ${input.implementationName}`, () => {
    it.each([
      {
        condition: 'a spec imports the file it proves',
        filePath: 'src/__tests__/order.test.ts',
        importedPaths: [
          'src/order.ts',
        ],
      },
      {
        condition: 'a file imports another',
        filePath: 'src/order.ts',
        importedPaths: [
          'src/price.ts',
        ],
      },
      {
        condition: 'a file imports none',
        filePath: 'src/price.ts',
        importedPaths: [],
      },
    ])(
      'should list the files of the unit a file imports when $condition',
      ({ filePath, importedPaths }) => {
        // Arrange
        const graph = input.graphOfScenario();

        // Act
        const found = graph.directImportsOf(UnitRelativePath.create(filePath));

        // Assert
        expect(found).toStrictEqual(importedPaths.map(UnitRelativePath.create));
      },
    );
  });
};

export { IMPORT_SCENARIO, importGraphSuite };
