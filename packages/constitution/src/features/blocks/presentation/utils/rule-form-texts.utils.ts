import { RULE_TABLE_CELLS, RULE_TABLE_HEADER } from '#/kernel/constants';
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
};

export { ruleFormTexts };
