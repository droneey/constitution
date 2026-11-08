import { describe, expect, it } from 'bun:test';

import type { ProblemOf } from '#/kernel/types';
import { textOf } from '#/shared/cli';

import type { BudgetDetails } from '../../../domain/validate-constitution/services';
import { BudgetCode } from '../../../domain/validate-constitution/services';
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
          budget: 1500,
          lines: 1501,
        },
      },
      text: 'has 1501 lines; a file holds at most 1500, and a longer block splits into chapters',
    },
  ])('should say $problem.code as the report words it', ({ problem, text }) => {
    // Act
    const said = textOf(budgetTexts, problem.code, problem.details);

    // Assert
    expect(said).toBe(text);
  });
});
