import type { TextsOf } from '#/shared/cli';

import type { BudgetDetails } from '../../domain/use-cases/queries/check';
import { BudgetCode } from '../../domain/use-cases/queries/check';

const budgetTexts: TextsOf<BudgetDetails> = {
  [BudgetCode.FileOverBudget]: ({ budget, lines }) =>
    `has ${lines} lines; a file holds at most ${budget}, and a longer block splits into chapters`,
};

export { budgetTexts };
