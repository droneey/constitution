import { describe, expect, it } from 'bun:test';

import type { FindingOf } from '#/kernel/types';

import { sectionedRule } from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { checkInputOf } from '../../../../../../application/use-cases/queries/check/__tests__/check.fixtures';
import type { BudgetDetails } from '../budget';
import { BudgetCode, budgetCheck } from '../budget';

const PRINCIPLES = 'blocks/core/@foundation/principles.md';

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
      lines: 1500,
    },
    {
      expected: [
        {
          code: BudgetCode.FileOverBudget,
          details: {
            budget: 1500,
            lines: 1501,
          },
          path: PRINCIPLES,
        },
      ],
      lines: 1501,
    },
  ])('should hold a file to 1500 lines when it has $lines', ({ expected, lines }) => {
    // Arrange
    const files = validFiles();

    files[PRINCIPLES] = linesOf(lines);

    const input = checkInputOf(files);

    // Act
    const findings = budgetCheck(input);

    // Assert
    expect(findings).toStrictEqual(expected);
  });

  it('should leave the examples of a rule out of the lines it counts', () => {
    // Arrange
    const files = validFiles();

    files[PRINCIPLES] = `# Principles\n\n## General\n\n${sectionedRule({
      examples: `\`\`\`text title="Prefer"\n${linesOf(600)}\n\`\`\``,
      slug: 'a-rule',
    })}`;

    const input = checkInputOf(files);

    // Act
    const findings = budgetCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });
});
