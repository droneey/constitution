import { describe, expect, it } from 'bun:test';

import { UnitRelativePath } from '#/kernel/value-objects';

import type { BranchReader } from '../application/contracts';
import { LineRange } from '../domain/value-objects';

const BRANCH_SCENARIO = {
  baseOrderText: 'export const total = 1;\n',
  newLineText: 'export const line = 1;\n',
  orderText: 'export const total = 2;\n',
} as const;

const orderPath = UnitRelativePath.create('src/order.ts');
const linePath = UnitRelativePath.create('src/line.ts');

interface BranchReaderSuiteInput {
  readonly implementationName: string;
  readonly readerOfScenario: () => BranchReader;
}

const branchReaderSuite = (input: BranchReaderSuiteInput): void => {
  describe(`the BranchReader contract, kept by ${input.implementationName}`, () => {
    it('should read the branch’s changed files by the lines it wrote, and its new files', () => {
      // Arrange
      const reader = input.readerOfScenario();

      // Act
      const branch = reader.read();

      // Assert
      expect({
        changedFiles: branch.changedFiles,
        newFilePaths: branch.newFilePaths,
      }).toStrictEqual({
        changedFiles: [
          {
            filePath: orderPath,
            lineRanges: [
              LineRange.create({
                endLine: 1,
                startLine: 1,
              }),
            ],
          },
        ],
        newFilePaths: [
          linePath,
        ],
      });
    });

    it('should read the text a file had on the main line, and none for a file it never had', () => {
      // Arrange
      const branch = input.readerOfScenario().read();

      // Act
      const baseTexts = branch.baseTextsOf([
        orderPath,
        linePath,
      ]);

      // Assert
      expect(baseTexts).toStrictEqual(
        new Map([
          [
            orderPath,
            BRANCH_SCENARIO.baseOrderText,
          ],
        ]),
      );
    });
  });
};

export { BRANCH_SCENARIO, branchReaderSuite };
