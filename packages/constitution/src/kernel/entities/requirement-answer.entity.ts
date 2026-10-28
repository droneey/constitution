import { REQUIREMENTS_HEADING, REQUIREMENTS_TABLE_HEADER } from '../constants';
import type { FindingOf } from '../types';
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

interface RequirementsTableDetails {
  readonly [RequirementsTableCode.HeaderMisshapen]: {
    readonly row: string;
  };
  readonly [RequirementsTableCode.RowMisshapen]: {
    readonly row: string;
  };
  readonly [RequirementsTableCode.HeadingMisshapen]: {
    readonly heading: string;
  };
}

interface AnswerSource {
  readonly block: BlockId;
  readonly file: string;
  readonly seam?: BlockId;
  readonly text: string;
}

interface RequirementsParsed {
  readonly answers: readonly RequirementAnswer[];
  readonly findings: readonly FindingOf<RequirementsTableDetails>[];
}

const NEAR_SECTION = /^#{1,6}\s*requirements$/i;
const ROW = /^\|\s*`?([a-z0-9]+(?:-[a-z0-9]+)*)`?\s*\|\s*([^|]*?)\s*\|\s*([^|]*?)\s*\|$/;
const SEPARATOR = /^\|?[\s:|-]+\|?$/;
const NEAR_HEADER = /^\|\s*Requirement\s*\|/;
const PIPE = '|';

const unpadded = (row: string): string =>
  row
    .split(PIPE)
    .map((cell) => cell.trim())
    .join(PIPE);

const headerRow = unpadded(REQUIREMENTS_TABLE_HEADER);

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
    .filter((line) => line.includes(PIPE) && !SEPARATOR.test(line) && unpadded(line) !== headerRow);

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
      .map((row) => ({
        code: NEAR_HEADER.test(row)
          ? RequirementsTableCode.HeaderMisshapen
          : RequirementsTableCode.RowMisshapen,
        details: {
          row,
        },
        path: input.source.file,
      })),
  };
};

const readSection = (input: {
  section: MarkdownSection;
  source: AnswerSource;
}): RequirementsParsed => {
  const heading = input.section.heading.trim();

  if (heading === REQUIREMENTS_HEADING) {
    return rowsOf(input);
  }

  return {
    answers: [],
    findings: NEAR_SECTION.test(heading)
      ? [
          {
            code: RequirementsTableCode.HeadingMisshapen,
            details: {
              heading,
            },
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

export type { RequirementsParsed, RequirementsTableDetails };
export { Met, RequirementAnswer, RequirementsTableCode };
