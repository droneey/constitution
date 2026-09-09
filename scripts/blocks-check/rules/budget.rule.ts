import type { Chapter, Constitution, Finding, Rule } from '../models';
import { CHAPTER_LINE_BUDGET } from '../models';

const lineCount = (text: string): number =>
  text.replace(/\n$/, '').split('\n').length;

const withinBudget = (chapter: Chapter): readonly Finding[] => {
  const lines = lineCount(chapter.text);

  return lines <= CHAPTER_LINE_BUDGET
    ? []
    : [
        {
          message: `has ${lines} lines; a chapter stays under ${CHAPTER_LINE_BUDGET} or becomes a folder with an index`,
          path: chapter.path,
        },
      ];
};

const opensWithTitle = (chapter: Chapter): readonly Finding[] =>
  chapter.text.startsWith('# ')
    ? []
    : [
        {
          message: 'does not open with a level-one heading',
          path: chapter.path,
        },
      ];

const budgetRule: Rule = ({ blocks }: Constitution): readonly Finding[] =>
  blocks
    .flatMap((block) => block.chapters)
    .flatMap((chapter) => [
      ...withinBudget(chapter),
      ...opensWithTitle(chapter),
    ]);

export { budgetRule };
