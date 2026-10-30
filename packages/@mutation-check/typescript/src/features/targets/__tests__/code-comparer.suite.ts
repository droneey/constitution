import { describe, expect, it } from 'bun:test';

import { UnitRelativePath } from '#/kernel/value-objects';

import type { CodeComparer } from '../application/contracts';

const orderPath = UnitRelativePath.create('src/order.ts');
const CURRENT_TEXT = 'export const total = 2;\n';

interface CodeComparerSuiteInput {
  readonly comparerHolding: (currentTexts: ReadonlyMap<UnitRelativePath, string>) => CodeComparer;
  readonly implementationName: string;
}

const codeComparerSuite = (input: CodeComparerSuiteInput): void => {
  describe(`the CodeComparer contract, kept by ${input.implementationName}`, () => {
    const comparer = input.comparerHolding(
      new Map([
        [
          orderPath,
          CURRENT_TEXT,
        ],
      ]),
    );

    it.each([
      {
        baseText: CURRENT_TEXT,
        condition: 'the file holds its base’s text',
        isChanged: false,
      },
      {
        baseText: 'export const total = 1;\n',
        condition: 'the file’s code differs from its base’s',
        isChanged: true,
      },
      {
        baseText: undefined,
        condition: 'the main line never had the file, which holds code',
        isChanged: true,
      },
    ])('should tell whether the code changed when $condition', ({ baseText, isChanged }) => {
      // Act
      const hasChanged = comparer.hasCodeChanged(orderPath, baseText);

      // Assert
      expect(hasChanged).toBe(isChanged);
    });
  });
};

export { codeComparerSuite };
