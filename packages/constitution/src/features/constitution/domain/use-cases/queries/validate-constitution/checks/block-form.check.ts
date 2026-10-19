import type { Finding, Problem } from '#/kernel/types';

import type { Block, BlockFile, Rule } from '../../../../entities';
import { BlockFileRole } from '../../../../entities';
import { withoutCodeFences } from '../../../../utils';
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

const RULE_HEADING = '### ';
const TITLE = /^# (.+)/;
const GOVERNS = '> Governs ';
const SECTION = /^## (.+)/;
/** first in a file that holds it */
const GENERAL = 'General';
/** last in a file that holds it */
const REQUIREMENTS = 'Requirements for implementation';

const linesOf = (file: BlockFile): readonly string[] => withoutCodeFences(file.body).split('\n');

// The passport says what the block is and how it is set up; its rules live in its axes' chapters.
const passportFindings = (block: Block): readonly Finding[] =>
  block.files
    .filter((file) => file.role === BlockFileRole.Passport)
    .flatMap(linesOf)
    .some((line) => line.startsWith(RULE_HEADING))
    ? [
        {
          code: BlockFormCode.PassportHoldsRules,
          message:
            "holds rules; a block's passport holds its front matter, its title, what the block is, its setup and an implementation's Requirements, and its rules live in the chapters of its axes",
          path: block.path,
        },
      ]
    : [];

const openingOf = (
  lines: readonly string[],
): {
  governs: string | undefined;
  title: string | undefined;
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
}): readonly Problem[] =>
  opening.title !== undefined && opening.governs?.startsWith(GOVERNS) === true
    ? []
    : [
        {
          code: BlockFormCode.WithoutGoverns,
          message: `opens without its "# <Title>" and a "${GOVERNS}…" line; a chapter or a seam opens with both`,
        },
      ];

const sectionProblems = (input: {
  sections: readonly string[];
  title: string | undefined;
}): readonly Problem[] => {
  const { sections, title } = input;
  const requirements = sections.indexOf(REQUIREMENTS);

  return [
    ...sections
      .filter((section) => section.toLowerCase() === title?.toLowerCase())
      .map((section) => ({
        code: BlockFormCode.SectionRepeatsTitle,
        message: `has the section "${section}", named like the file's title; a section names a part of the file's subject`,
      })),
    ...(requirements === -1 || requirements === sections.length - 1
      ? []
      : [
          {
            code: BlockFormCode.RequirementsNotLast,
            message: `has sections after "${REQUIREMENTS}", which is the last section`,
          },
        ]),
    ...(sections.indexOf(GENERAL) > 0
      ? [
          {
            code: BlockFormCode.GeneralNotFirst,
            message: `has sections before "${GENERAL}", which is the first section`,
          },
        ]
      : []),
  ];
};

const ruleProblems = (rules: readonly Rule[]): readonly Problem[] =>
  rules.length === 0
    ? [
        {
          code: BlockFormCode.WithoutRules,
          message: 'holds no rule; a chapter or a seam holds at least one',
        },
      ]
    : rules
        .filter((rule) => rule.chapter === undefined)
        .map((rule) => ({
          code: BlockFormCode.RuleOutsideSection,
          message: `has the rule "${rule.slug}" under no section; every rule sits under a "## " section`,
        }));

const fileFindings = (input: { file: BlockFile; rules: readonly Rule[] }): readonly Finding[] => {
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

const blockFormCheck: Check = ({ constitution }: CheckInput): readonly Finding[] =>
  constitution.blocks.flatMap((block) => [
    ...passportFindings(block),
    ...block.files
      .filter((file) => file.role !== BlockFileRole.Passport)
      .flatMap((file) =>
        fileFindings({
          file,
          rules: constitution.rules,
        }),
      ),
  ]);

export { blockFormCheck };
