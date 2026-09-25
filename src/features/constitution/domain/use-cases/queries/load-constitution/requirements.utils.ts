import type { RequirementAnswer } from '../../../entities';

const SECTION = '## Requirements';
const HEADING = /^#{1,2} /;
const ROW = /^\|\s*`?([^`|\s]+)`?\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*$/;
const SEPARATOR = /^\|[\s|:-]+\|$/;
const HEADER_CELL = 'Requirement';

const sectionOf = (lines: readonly string[]): readonly string[] => {
  const start = lines.indexOf(SECTION);

  if (start === -1) {
    return [];
  }

  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => HEADING.test(line));

  return end === -1 ? rest : rest.slice(0, end);
};

const parseRequirements = (input: {
  block: string;
  file: string;
  text: string;
  with: string | null;
}): readonly RequirementAnswer[] =>
  sectionOf(input.text.split('\n'))
    .filter((line) => !SEPARATOR.test(line))
    .flatMap((line) => {
      const row = ROW.exec(line);

      if (row === null || row[1] === HEADER_CELL) {
        return [];
      }

      return [
        {
          block: input.block,
          file: input.file,
          how: row[2] ?? '',
          requirement: row[1] ?? '',
          status: row[3] ?? '',
          with: input.with,
        },
      ];
    });

export { parseRequirements };
