import type { FindingOf } from '#/kernel/types';

import { Block } from '../../../../entities';
import type { Check, CheckInput } from '../check.types';

enum BudgetCode {
  FileOverBudget = 'file-over-line-budget',
}

interface BudgetDetails {
  readonly [BudgetCode.FileOverBudget]: {
    readonly budget: number;
    readonly lines: number;
  };
}

type BudgetFinding = FindingOf<BudgetDetails>;

const FILE_LINE_BUDGET = 500;

const budgetCheck: Check<BudgetFinding> = ({
  constitution,
}: CheckInput): readonly BudgetFinding[] =>
  constitution.blocks.flatMap((block) =>
    Block.filesOf(block)
      .filter((file) => file.lines > FILE_LINE_BUDGET)
      .map((file) => ({
        code: BudgetCode.FileOverBudget,
        details: {
          budget: FILE_LINE_BUDGET,
          lines: file.lines,
        },
        path: file.path,
      })),
  );

export type { BudgetDetails };
export { BudgetCode, budgetCheck };
