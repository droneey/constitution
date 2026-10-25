import { describe, expect, it } from 'bun:test';

import type { ProblemOf } from '#/kernel/types';
import { textOf } from '#/shared/cli';

import type { BudgetDetails } from '../../../domain/use-cases/queries/check';
import { BudgetCode } from '../../../domain/use-cases/queries/check';
import { budgetTexts } from '../budget-texts.utils';

describe('budgetTexts', () => {
  it.each<{
    problem: ProblemOf<BudgetDetails>;
    text: string;
  }>([
    {
      problem: {
        code: BudgetCode.FileOverBudget,
        details: {
          budget: 500,
          lines: 501,
        },
      },
      text: 'has 501 lines; a file holds at most 500, and a longer block splits into chapters',
    },
  ])('should say $problem.code as the report words it', ({ problem, text }) => {
    // Arrange
    const reported = problem;

    // Act
    const said = textOf(budgetTexts, reported.code, reported.details);

    // Assert
    expect(said).toBe(text);
  });
});
