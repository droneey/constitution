import { BlockFormat } from '#/kernel/constants';
import type { RequirementsParsed, Rule, RulesParsed } from '#/kernel/entities';
import { RequirementAnswer, StatedRule } from '#/kernel/entities';

import { Block } from '../../../../../../../../domain/block/entities';

interface BlockRulesParsed {
  readonly answers: readonly RequirementAnswer[];
  readonly findings: readonly (
    | RequirementsParsed['findings'][number]
    | RulesParsed['findings'][number]
  )[];
  readonly rules: readonly Rule[];
}

interface ParseRulesInput {
  readonly blocks: readonly Block[];
  readonly format: BlockFormat;
}

const parseRules = (input: ParseRulesInput): BlockRulesParsed => {
  const sources = input.blocks.flatMap(Block.ruleSourcesOf);
  const parsed = sources.map(StatedRule.parse);
  const stated = parsed.flatMap((rules) => rules.rules);
  const answers = sources.map(RequirementAnswer.parse);

  return {
    answers: answers.flatMap((read) => read.answers),
    findings: [
      ...parsed.flatMap((rules) => rules.findings),
      ...(input.format === BlockFormat.Nested ? StatedRule.retiredLevelsIn(stated) : []),
      ...answers.flatMap((read) => read.findings),
    ],
    rules: StatedRule.inheritLevels(stated),
  };
};

export { parseRules };
