import type { Finding } from '#/kernel/types';

import type { RequirementAnswer } from '../../../entities';
import type { MarkdownSection } from '../../../utils';
import { sectionsOf } from '../../../utils';

enum RequirementsTableCode {
  HeaderMisshapen = 'requirements-header-misshapen',
  RowMisshapen = 'requirements-row-misshapen',
  HeadingMisshapen = 'requirements-heading-misshapen',
}

interface Source {
  block: string;
  file: string;
  text: string;
  with: string | undefined;
}

interface RequirementsParsed {
  answers: readonly RequirementAnswer[];
  findings: readonly Finding[];
}

const SECTION = '## Requirements';
const NEAR_SECTION = /^#{1,6}\s*requirements$/i;
const ROW = /^\|\s*`?([a-z0-9]+(?:-[a-z0-9]+)*)`?\s*\|\s*([^|]*?)\s*\|\s*([^|]*?)\s*\|$/;
const SEPARATOR = /^\|?[\s:|-]+\|?$/;
const HEADER = /^\|\s*Requirement\s*\|\s*How\s*\|\s*Met\s*\|$/;
const NEAR_HEADER = /^\|\s*Requirement\s*\|/;
const PIPE = '|';

const rowsOf = (input: { section: MarkdownSection; source: Source }): RequirementsParsed => {
  const rows = input.section.lines
    .map((line) => line.trim())
    .filter((line) => line.includes(PIPE) && !SEPARATOR.test(line) && !HEADER.test(line));

  return {
    answers: rows.flatMap((row) => {
      const match = ROW.exec(row);

      if (match === null) {
        return [];
      }

      // Stryker disable next-line StringLiteral: the pattern always captures all three
      const [, requirement = '', how = '', met = ''] = match;

      return [
        {
          block: input.source.block,
          file: input.source.file,
          how,
          met,
          requirement,
          with: input.source.with,
        },
      ];
    }),
    findings: rows
      .filter((row) => !ROW.test(row))
      .map((row) =>
        NEAR_HEADER.test(row)
          ? {
              code: RequirementsTableCode.HeaderMisshapen,
              message: `has the header "${row}" in its Requirements; it is "| Requirement | How | Met |"`,
              path: input.source.file,
            }
          : {
              code: RequirementsTableCode.RowMisshapen,
              message: `has the row "${row}" in its Requirements, which is not "| \`<requirement>\` | <how> | <met> |"`,
              path: input.source.file,
            },
      ),
  };
};

const readSection = (input: { section: MarkdownSection; source: Source }): RequirementsParsed => {
  const heading = input.section.heading.trim();

  if (heading === SECTION) {
    return rowsOf(input);
  }

  return {
    answers: [],
    findings: NEAR_SECTION.test(heading)
      ? [
          {
            code: RequirementsTableCode.HeadingMisshapen,
            message: `has the heading "${heading}", which names the Requirements section; it is "${SECTION}"`,
            path: input.source.file,
          },
        ]
      : [],
  };
};

const parseRequirements = (source: Source): RequirementsParsed => {
  const read = sectionsOf(source.text).map((section) =>
    readSection({
      section,
      source,
    }),
  );

  return {
    answers: read.flatMap((section) => section.answers),
    findings: read.flatMap((section) => section.findings),
  };
};

export { parseRequirements };
