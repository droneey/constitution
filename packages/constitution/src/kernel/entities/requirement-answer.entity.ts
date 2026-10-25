import type { Finding } from '../types';
import type { MarkdownSection } from '../utils';
import { sectionsOf } from '../utils';
import type { BlockId } from '../value-objects';
import { RuleSlug } from '../value-objects';

enum Met {
  Yes = 'yes',
  Partly = 'partly',
  No = 'no',
}

interface RequirementAnswer {
  readonly block: BlockId;
  readonly file: string;
  readonly how: string;
  readonly requirement: RuleSlug;
  readonly seam?: BlockId;
  readonly writtenMet: string;
}

enum RequirementsTableCode {
  HeaderMisshapen = 'requirements-header-misshapen',
  RowMisshapen = 'requirements-row-misshapen',
  HeadingMisshapen = 'requirements-heading-misshapen',
}

interface AnswerSource {
  readonly block: BlockId;
  readonly file: string;
  readonly seam?: BlockId;
  readonly text: string;
}

interface RequirementsParsed {
  readonly answers: readonly RequirementAnswer[];
  readonly findings: readonly Finding[];
}

const SECTION = '## Requirements';
const NEAR_SECTION = /^#{1,6}\s*requirements$/i;
const ROW = /^\|\s*`?([a-z0-9]+(?:-[a-z0-9]+)*)`?\s*\|\s*([^|]*?)\s*\|\s*([^|]*?)\s*\|$/;
const SEPARATOR = /^\|?[\s:|-]+\|?$/;
const HEADER = /^\|\s*Requirement\s*\|\s*How\s*\|\s*Met\s*\|$/;
const NEAR_HEADER = /^\|\s*Requirement\s*\|/;
const PIPE = '|';

const create = (input: RequirementAnswer): RequirementAnswer => ({
  block: input.block,
  file: input.file,
  how: input.how,
  requirement: input.requirement,
  ...(input.seam === undefined
    ? {}
    : {
        seam: input.seam,
      }),
  writtenMet: input.writtenMet,
});

const rowsOf = (input: { section: MarkdownSection; source: AnswerSource }): RequirementsParsed => {
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
      const [, requirement = '', how = '', writtenMet = ''] = match;

      return [
        create({
          block: input.source.block,
          file: input.source.file,
          how,
          requirement: RuleSlug.create(requirement),
          // Stryker disable next-line ConditionalExpression: create leaves an absent seam out
          ...(input.source.seam === undefined
            ? {}
            : {
                seam: input.source.seam,
              }),
          writtenMet,
        }),
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

const readSection = (input: {
  section: MarkdownSection;
  source: AnswerSource;
}): RequirementsParsed => {
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

const parse = (source: AnswerSource): RequirementsParsed => {
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

const metOf = (answer: RequirementAnswer): Met | undefined =>
  Object.values(Met).find((met) => met === answer.writtenMet);

const RequirementAnswer = {
  create,
  metOf,
  parse,
} as const;

export type { AnswerSource, RequirementsParsed };
export { Met, RequirementAnswer, RequirementsTableCode };
