import { describe, expect, it } from 'bun:test';

import type { FindingOf } from '#/kernel/types';

import { checkInputOf } from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import type { BudgetDetails } from '../budget';
import { BudgetCode, budgetCheck } from '../budget';

const PRINCIPLES = 'blocks/core/foundation/principles.md';

const linesOf = (count: number): string =>
  Array.from(
    {
      length: count,
    },
    () => 'Line.',
  ).join('\n');

describe('budgetCheck', () => {
  it.each<{
    expected: readonly FindingOf<BudgetDetails>[];
    lines: number;
  }>([
    {
      expected: [],
      lines: 500,
    },
    {
      expected: [
        {
          code: BudgetCode.FileOverBudget,
          details: {
            budget: 500,
            lines: 501,
          },
          path: PRINCIPLES,
        },
      ],
      lines: 501,
    },
  ])('should hold a file to 500 lines when it has $lines', ({ expected, lines }) => {
    // Arrange
    const files = validFiles();

    files[PRINCIPLES] = linesOf(lines);

    const input = checkInputOf(files);

    // Act
    const findings = budgetCheck(input);

    // Assert
    expect(findings).toStrictEqual(expected);
  });
});
