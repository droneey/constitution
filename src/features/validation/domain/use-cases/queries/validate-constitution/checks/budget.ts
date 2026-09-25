import type { Constitution } from '#/features/constitution';
import type { Finding } from '#/kernel';

import type { Check } from '../check.types';

const CHAPTER_LINE_BUDGET = 500;

const lineCount = (text: string): number =>
  (text.endsWith('\n') ? text.slice(0, -1) : text).split('\n').length;

const budgetCheck: Check = (constitution: Constitution): readonly Finding[] =>
  constitution.blocks.flatMap((block) =>
    block.files
      .filter((file) => lineCount(file.text) > CHAPTER_LINE_BUDGET)
      .map((file) => ({
        message: `has ${lineCount(file.text)} lines; a file holds at most ${CHAPTER_LINE_BUDGET}, and a longer block splits into chapters`,
        path: file.path,
      })),
  );

export { budgetCheck };
