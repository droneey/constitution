import type { Finding } from '#/kernel/types';

import { Block } from '../../../../entities';
import type { Check, CheckInput } from '../check.types';

enum BudgetCode {
  FileOverBudget = 'file-over-line-budget',
}

const FILE_LINE_BUDGET = 500;

const budgetCheck: Check = ({ constitution }: CheckInput): readonly Finding[] =>
  constitution.blocks.flatMap((block) =>
    Block.filesOf(block)
      .filter((file) => file.lines > FILE_LINE_BUDGET)
      .map((file) => ({
        code: BudgetCode.FileOverBudget,
        message: `has ${file.lines} lines; a file holds at most ${FILE_LINE_BUDGET}, and a longer block splits into chapters`,
        path: file.path,
      })),
  );

export { budgetCheck };
