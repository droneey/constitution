import {
  RULE_EXAMPLES_HEADING,
  RULE_TABLE_CELLS,
  RULE_TABLE_HEADER,
  RULE_WHY_HEADING,
} from '#/kernel/constants';
import type { RuleFormDetails } from '#/kernel/entities';
import { RuleFormCode } from '#/kernel/entities';
import type { TextsOf } from '#/shared/cli';

const ruleFormTexts: TextsOf<RuleFormDetails> = {
  [RuleFormCode.HeadingMisshapen]: ({ heading }) =>
    `heading "${heading}" looks like a rule but is not "### <slug> · <LEVEL>", "### <slug> → <parent>" or "### <slug> → <parent> · <LEVEL>"`,
  [RuleFormCode.WithoutTable]: ({ slug }) => `rule "${slug}" has no table "${RULE_TABLE_HEADER}"`,
  [RuleFormCode.TablesMany]: ({ count, slug }) =>
    `rule "${slug}" has ${count} tables; a rule has one`,
  [RuleFormCode.HeaderMisshapen]: ({ slug }) =>
    `rule "${slug}" has a table whose header is not "${RULE_TABLE_HEADER}"`,
  [RuleFormCode.RowsNotOne]: ({ count, slug }) =>
    `rule "${slug}" has ${count} rows in its table; a rule's table has one`,
  [RuleFormCode.CellsMiscounted]: ({ count, slug }) =>
    `rule "${slug}" has a row of ${count} cells; a rule's table has ${RULE_TABLE_CELLS}`,
  [RuleFormCode.HoldsLabel]: ({ label, slug }) =>
    `rule "${slug}" has the label "${label}"; a rule states its Why in its table and holds no label but Example`,
  [RuleFormCode.LevelRetired]: ({ slug }) =>
    `rule "${slug}" is MAY in its heading; a heading states MUST or SHOULD, and only an override sets a rule to MAY`,
  [RuleFormCode.WithoutWhySection]: ({ slug }) =>
    `rule "${slug}" has no section "${RULE_WHY_HEADING}" after its statement`,
  [RuleFormCode.WhyMisplaced]: ({ slug }) =>
    `rule "${slug}" has its section "${RULE_WHY_HEADING}" after another; it comes right after the statement`,
  [RuleFormCode.WithoutExamples]: ({ slug }) =>
    `rule "${slug}" has no section "${RULE_EXAMPLES_HEADING}" after its Why`,
  [RuleFormCode.ExamplesNotLast]: ({ slug }) =>
    `rule "${slug}" has a section after "${RULE_EXAMPLES_HEADING}"; Examples comes last`,
  [RuleFormCode.ExamplesHoldProse]: ({ slug }) =>
    `rule "${slug}" has text outside a code block in "${RULE_EXAMPLES_HEADING}", which holds only fenced blocks`,
  [RuleFormCode.ExamplesHoldHeading]: ({ heading, slug }) =>
    `rule "${slug}" has the heading "${heading}" inside "${RULE_EXAMPLES_HEADING}", which holds only fenced blocks`,
  [RuleFormCode.ExampleUntitled]: ({ language, slug }) =>
    `rule "${slug}" has a ${language === '' ? 'code' : language} block without a title in "${RULE_EXAMPLES_HEADING}"; each block has title="…"`,
  [RuleFormCode.SectionUnknown]: ({ heading, slug }) =>
    `rule "${slug}" has the section "${heading}"; a rule holds only "${RULE_WHY_HEADING}" and "${RULE_EXAMPLES_HEADING}"`,
  [RuleFormCode.FormsMixed]: ({ sectioned, tabled }) =>
    `holds rules with a Why table, as "${tabled}", and rules with a section "${RULE_WHY_HEADING}", as "${sectioned}"; a chapter holds one form`,
};

export { ruleFormTexts };
