import type { Rule } from '#/kernel/entities';
import type { FindingOf, ProblemOf } from '#/kernel/types';
import { withoutCodeFences } from '#/kernel/utils';
import type { RuleSlug } from '#/kernel/value-objects';

import type { Block, BlockFile } from '../../../../block/entities';
import { GENERAL_SECTION, GOVERNS_LINE, REQUIREMENTS_SECTION } from '../../../constants';
import type { Check, CheckInput } from '../check.types';

enum BlockFormCode {
  PassportHoldsRules = 'passport-holds-rules',
  WithoutGoverns = 'file-without-governs',
  WithoutRules = 'chapter-without-rules',
  RuleOutsideSection = 'rule-outside-section',
  SectionRepeatsTitle = 'section-repeats-title',
  RequirementsNotLast = 'requirements-section-not-last',
  GeneralNotFirst = 'general-section-not-first',
}

interface BlockFormDetails {
  readonly [BlockFormCode.PassportHoldsRules]: object;
  readonly [BlockFormCode.WithoutGoverns]: object;
  readonly [BlockFormCode.WithoutRules]: object;
  readonly [BlockFormCode.RuleOutsideSection]: {
    readonly slug: RuleSlug;
  };
  readonly [BlockFormCode.SectionRepeatsTitle]: {
    readonly section: string;
  };
  readonly [BlockFormCode.RequirementsNotLast]: object;
  readonly [BlockFormCode.GeneralNotFirst]: object;
}

type BlockFormFinding = FindingOf<BlockFormDetails>;

type BlockFormProblem = ProblemOf<BlockFormDetails>;

const RULE_HEADING = '### ';
const TITLE = /^# (.+)/;
const SECTION = /^## (.+)/;

const linesOf = (file: BlockFile): readonly string[] => withoutCodeFences(file.body).split('\n');

const passportFindings = (block: Block): readonly BlockFormFinding[] =>
  linesOf(block.passport).some((line) => line.startsWith(RULE_HEADING))
    ? [
        {
          code: BlockFormCode.PassportHoldsRules,
          details: {},
          path: block.passport.path,
        },
      ]
    : [];

const openingOf = (
  lines: readonly string[],
): {
  readonly governs: string | undefined;
  readonly title: string | undefined;
} => {
  const [first, second] = lines.filter((line) => line.trim() !== '');

  return {
    // Stryker disable next-line StringLiteral: no title is read from either text
    title: TITLE.exec(first ?? '')?.[1],
    governs: second,
  };
};

const openingProblems = (opening: {
  governs: string | undefined;
  title: string | undefined;
}): readonly BlockFormProblem[] =>
  opening.title !== undefined && opening.governs?.startsWith(GOVERNS_LINE) === true
    ? []
    : [
        {
          code: BlockFormCode.WithoutGoverns,
          details: {},
        },
      ];

const sectionProblems = (input: {
  sections: readonly string[];
  title: string | undefined;
}): readonly BlockFormProblem[] => {
  const { sections, title } = input;
  const requirements = sections.indexOf(REQUIREMENTS_SECTION);

  return [
    ...sections
      .filter((section) => section.toLowerCase() === title?.toLowerCase())
      .map(
        (section): BlockFormProblem => ({
          code: BlockFormCode.SectionRepeatsTitle,
          details: {
            section,
          },
        }),
      ),
    ...(requirements === -1 || requirements === sections.length - 1
      ? []
      : [
          {
            code: BlockFormCode.RequirementsNotLast,
            details: {},
          } satisfies BlockFormProblem,
        ]),
    ...(sections.indexOf(GENERAL_SECTION) > 0
      ? [
          {
            code: BlockFormCode.GeneralNotFirst,
            details: {},
          } satisfies BlockFormProblem,
        ]
      : []),
  ];
};

const ruleProblems = (rules: readonly Rule[]): readonly BlockFormProblem[] =>
  rules.length === 0
    ? [
        {
          code: BlockFormCode.WithoutRules,
          details: {},
        },
      ]
    : rules
        .filter((rule) => rule.section === undefined)
        .map(
          (rule): BlockFormProblem => ({
            code: BlockFormCode.RuleOutsideSection,
            details: {
              slug: rule.slug,
            },
          }),
        );

const fileFindings = (input: {
  file: BlockFile;
  rules: readonly Rule[];
}): readonly BlockFormFinding[] => {
  const { file } = input;
  const lines = linesOf(file);
  const opening = openingOf(lines);

  return [
    ...openingProblems(opening),
    ...ruleProblems(input.rules.filter((rule) => rule.file === file.path)),
    ...sectionProblems({
      sections: lines.flatMap((line) => SECTION.exec(line)?.[1] ?? []),
      title: opening.title,
    }),
  ].map((problem) => ({
    ...problem,
    path: file.path,
  }));
};

const blockFormCheck: Check<BlockFormFinding> = ({
  constitution,
}: CheckInput): readonly BlockFormFinding[] =>
  constitution.blocks.flatMap((block) => [
    ...passportFindings(block),
    ...block.parts.flatMap((file) =>
      fileFindings({
        file,
        rules: constitution.rules,
      }),
    ),
  ]);

export type { BlockFormDetails };
export { BlockFormCode, blockFormCheck };
