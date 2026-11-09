import { Layer, VOCABULARY_SECTION } from '#/kernel/constants';
import type { Rule } from '#/kernel/entities';
import type { FindingOf, ProblemOf } from '#/kernel/types';
import { maskInlineCode, withoutCodeFences } from '#/kernel/utils';
import type { RuleSlug } from '#/kernel/value-objects';

import type { Block, BlockFile } from '../../../../block/entities';
import { GENERAL_SECTION, GOVERNS_LINE } from '../../../constants';
import { findingsAt } from '../../../utils';
import type { Check, CheckInput } from '../check.types';

enum BlockFormCode {
  PassportHoldsRules = 'passport-holds-rules',
  WithoutGoverns = 'file-without-governs',
  WithoutRules = 'chapter-without-rules',
  RuleOutsideSection = 'rule-outside-section',
  SectionRepeatsTitle = 'section-repeats-title',
  GeneralNotFirst = 'general-section-not-first',
  TextBeforeSections = 'text-before-first-section',
  VocabularyNotFirst = 'vocabulary-section-not-first',
  RuleInVocabulary = 'rule-in-vocabulary',
  SectionWithoutRules = 'section-without-rules',
  TermOutsideVocabulary = 'term-defined-outside-vocabulary',
  PassportMisshapen = 'passport-misshapen',
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
  readonly [BlockFormCode.GeneralNotFirst]: object;
  readonly [BlockFormCode.TextBeforeSections]: object;
  readonly [BlockFormCode.VocabularyNotFirst]: object;
  readonly [BlockFormCode.RuleInVocabulary]: {
    readonly slug: RuleSlug;
  };
  readonly [BlockFormCode.SectionWithoutRules]: {
    readonly section: string;
  };
  readonly [BlockFormCode.TermOutsideVocabulary]: {
    readonly written: string;
  };
  readonly [BlockFormCode.PassportMisshapen]: object;
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
  ruleSections: readonly (string | undefined)[];
  sections: readonly string[];
  title: string | undefined;
}): readonly BlockFormProblem[] => {
  const { sections, title } = input;
  // Why: a vocabulary or a tree that opens a chapter holds no rule, so General leads the
  // sections that hold one.
  const sectionsOfRules = sections.filter((section) => input.ruleSections.includes(section));

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
    ...(sectionsOfRules.indexOf(GENERAL_SECTION) > 0
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

const QUOTE = '> ';
const HEADING = '#';
const BOLD = /\*\*(?![\s*])([^*\n]+?)(?<![\s*])\*\*/g;
const TERM_ID = /\{#[^}\n]*\}/g;

const definitionsIn = (line: string): readonly string[] => {
  const masked = maskInlineCode(line);

  return [
    ...[
      ...masked.matchAll(BOLD),
    ].map((match) => line.slice(match.index, match.index + match[0].length)),
    ...(masked.match(TERM_ID) ?? []),
  ];
};

const definitionProblems = (input: {
  lines: readonly string[];
  isPassport: boolean;
}): readonly BlockFormProblem[] => {
  let section: string | undefined;

  return input.lines.flatMap((line): readonly BlockFormProblem[] => {
    section = SECTION.exec(line)?.[1] ?? section;

    return !input.isPassport && section === VOCABULARY_SECTION
      ? []
      : definitionsIn(line).map((written) => ({
          code: BlockFormCode.TermOutsideVocabulary,
          details: {
            written,
          },
        }));
  });
};

const layoutProblems = (input: {
  lines: readonly string[];
  rules: readonly Rule[];
  sections: readonly string[];
}): readonly BlockFormProblem[] => {
  const { lines, sections } = input;
  const governs = lines.findIndex((line) => line.startsWith(GOVERNS_LINE));
  const afterGoverns = lines.slice(governs + 1);
  const sectionAt = afterGoverns.findIndex((line) => SECTION.test(line));
  const opening = sectionAt === -1 ? afterGoverns : afterGoverns.slice(0, sectionAt);
  const ruleSections = new Set(input.rules.map((rule) => rule.section));
  const vocabulary = sections.indexOf(VOCABULARY_SECTION);

  return [
    ...(governs !== -1 && opening.some((line) => line.trim() !== '')
      ? [
          {
            code: BlockFormCode.TextBeforeSections,
            details: {},
          } satisfies BlockFormProblem,
        ]
      : []),
    ...(vocabulary > 0
      ? [
          {
            code: BlockFormCode.VocabularyNotFirst,
            details: {},
          } satisfies BlockFormProblem,
        ]
      : []),
    ...input.rules
      .filter((rule) => rule.section === VOCABULARY_SECTION)
      .map(
        (rule): BlockFormProblem => ({
          code: BlockFormCode.RuleInVocabulary,
          details: {
            slug: rule.slug,
          },
        }),
      ),
    ...(input.rules.length === 0
      ? []
      : sections
          .filter((section) => section !== VOCABULARY_SECTION && !ruleSections.has(section))
          .map(
            (section): BlockFormProblem => ({
              code: BlockFormCode.SectionWithoutRules,
              details: {
                section,
              },
            }),
          )),
  ];
};

const fileFindings = (input: {
  file: BlockFile;
  rules: readonly Rule[];
}): readonly BlockFormFinding[] => {
  const { file } = input;
  const lines = linesOf(file);
  const opening = openingOf(lines);
  const rules = input.rules.filter((rule) => rule.file === file.path);
  const sections = lines.flatMap((line) => SECTION.exec(line)?.[1] ?? []);

  return [
    ...openingProblems(opening),
    ...ruleProblems(rules),
    ...sectionProblems({
      ruleSections: rules.map((rule) => rule.section),
      sections,
      title: opening.title,
    }),
    ...layoutProblems({
      lines,
      rules,
      sections,
    }),
    ...definitionProblems({
      isPassport: false,
      lines,
    }),
  ].map((problem) => ({
    ...problem,
    path: file.path,
  }));
};

const isPassportShaped = (lines: readonly string[]): boolean => {
  const written = lines.filter((line) => line.trim() !== '');

  return (
    written.findIndex((line) => TITLE.test(line)) === 0 &&
    written.findIndex((line) => line.startsWith(QUOTE)) === 1 &&
    written.slice(1).every((rest) => !rest.startsWith(HEADING)) &&
    written.filter((rest) => rest.startsWith(QUOTE)).length === 1
  );
};

const passportFormFindings = (block: Block): readonly BlockFormFinding[] => {
  const lines = linesOf(block.passport);

  return findingsAt(block.passport.path, [
    ...definitionProblems({
      isPassport: true,
      lines,
    }),
    block.layer === Layer.Core || isPassportShaped(lines)
      ? undefined
      : {
          code: BlockFormCode.PassportMisshapen,
          details: {},
        },
  ]);
};

const blockFormCheck: Check<BlockFormFinding> = ({
  constitution,
}: CheckInput): readonly BlockFormFinding[] =>
  constitution.blocks.flatMap((block) => [
    ...passportFindings(block),
    ...passportFormFindings(block),
    ...block.parts.flatMap((file) =>
      fileFindings({
        file,
        rules: constitution.rules,
      }),
    ),
  ]);

export type { BlockFormDetails };
export { BlockFormCode, blockFormCheck };
