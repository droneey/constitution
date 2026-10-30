import type { TextsOf } from '#/shared/cli';

import type { BudgetDetails } from '../../domain/services';
import { BudgetCode } from '../../domain/services';

const budgetTexts: TextsOf<BudgetDetails> = {
  [BudgetCode.FileOverBudget]: ({ budget, lines }) =>
    `has ${lines} lines; a file holds at most ${budget}, and a longer block splits into chapters`,
};

export { budgetTexts };
