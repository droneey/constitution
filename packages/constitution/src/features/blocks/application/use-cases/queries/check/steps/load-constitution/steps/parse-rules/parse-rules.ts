import type { Rule, RulesParsed } from '#/kernel/entities';
import { StatedRule } from '#/kernel/entities';

import { Block } from '../../../../../../../../domain/block/entities';

interface BlockRulesParsed {
  readonly findings: RulesParsed['findings'];
  readonly rules: readonly Rule[];
}

const parseRules = (blocks: readonly Block[]): BlockRulesParsed => {
  const parsed = blocks.flatMap(Block.ruleSourcesOf).map(StatedRule.parse);
  const stated = parsed.flatMap((rules) => rules.rules);

  return {
    findings: [
      ...parsed.flatMap((rules) => rules.findings),
      ...StatedRule.retiredLevelsIn(stated),
    ],
    rules: StatedRule.inheritLevels(stated),
  };
};

export { parseRules };
