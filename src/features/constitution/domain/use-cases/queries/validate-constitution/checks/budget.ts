import type { Finding } from '#/kernel';

import type { Check, CheckInput } from '../check.types';

const FILE_LINE_BUDGET = 500;

const budgetCheck: Check = ({ constitution }: CheckInput): readonly Finding[] =>
  constitution.blocks.flatMap((block) =>
    block.files
      .filter((file) => file.lines > FILE_LINE_BUDGET)
      .map((file) => ({
        message: `has ${file.lines} lines; a file holds at most ${FILE_LINE_BUDGET}, and a longer block splits into chapters`,
        path: file.path,
      })),
  );

export { budgetCheck };
