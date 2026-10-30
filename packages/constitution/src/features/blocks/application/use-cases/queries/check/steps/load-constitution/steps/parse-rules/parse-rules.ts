import type { RequirementsParsed, Rule, RulesParsed } from '#/kernel/entities';
import { RequirementAnswer, StatedRule } from '#/kernel/entities';

import { Block } from '../../../../../../../../domain/entities';

interface BlockRulesParsed {
  readonly answers: readonly RequirementAnswer[];
  readonly findings: readonly (
    | RequirementsParsed['findings'][number]
    | RulesParsed['findings'][number]
  )[];
  readonly rules: readonly Rule[];
}

const parseRules = (blocks: readonly Block[]): BlockRulesParsed => {
  const sources = blocks.flatMap(Block.ruleSourcesOf);
  const rules = sources.map(StatedRule.parse);
  const answers = sources.map(RequirementAnswer.parse);

  return {
    answers: answers.flatMap((parsed) => parsed.answers),
    findings: [
      ...rules.flatMap((parsed) => parsed.findings),
      ...answers.flatMap((parsed) => parsed.findings),
    ],
    rules: StatedRule.inheritLevels(rules.flatMap((parsed) => parsed.rules)),
  };
};

export { parseRules };
