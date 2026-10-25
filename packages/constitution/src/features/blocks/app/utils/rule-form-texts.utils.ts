import { RULE_TABLE_CELLS, RULE_TABLE_HEADER } from '#/kernel/constants';
import type { RequirementsTableDetails, RuleFormDetails } from '#/kernel/entities';
import { RequirementsTableCode, RuleFormCode } from '#/kernel/entities';
import type { TextsOf } from '#/shared/cli';

const ruleFormTexts: TextsOf<RequirementsTableDetails & RuleFormDetails> = {
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
  [RuleFormCode.TagsNotList]: ({ slug, tags }) =>
    `rule "${slug}" has the Tags "${tags}"; Tags is a list, such as [security, ux] or []`,
  [RuleFormCode.HoldsLabel]: ({ label, slug }) =>
    `rule "${slug}" has the label "${label}"; a rule states Why and Tags in its table and holds no label but Example`,
  [RequirementsTableCode.HeaderMisshapen]: ({ row }) =>
    `has the header "${row}" in its Requirements; it is "| Requirement | How | Met |"`,
  [RequirementsTableCode.RowMisshapen]: ({ row }) =>
    `has the row "${row}" in its Requirements, which is not "| \`<requirement>\` | <how> | <met> |"`,
  [RequirementsTableCode.HeadingMisshapen]: ({ heading }) =>
    `has the heading "${heading}", which names the Requirements section; it is "## Requirements"`,
};

export { ruleFormTexts };
