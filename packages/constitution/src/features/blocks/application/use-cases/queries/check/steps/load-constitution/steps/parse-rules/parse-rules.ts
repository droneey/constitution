import type { RequirementsParsed, Rule, RuleSource, RulesParsed } from '#/kernel/entities';
import { RequirementAnswer, StatedRule } from '#/kernel/entities';
import { withoutCodeFences } from '#/kernel/utils';

import type { BlockFile } from '../../../../../../../../domain/entities';
import { Block } from '../../../../../../../../domain/entities';

interface BlockRulesParsed {
  readonly answers: readonly RequirementAnswer[];
  readonly findings: readonly (
    | RequirementsParsed['findings'][number]
    | RulesParsed['findings'][number]
  )[];
  readonly rules: readonly Rule[];
}

const sourceOf = (input: { block: Block; file: BlockFile }): RuleSource => ({
  ...Block.placeOf(input.block, input.file),
  axis: input.file.axis,
  file: input.file.path,
  text: withoutCodeFences(input.file.body),
});

const parseRules = (blocks: readonly Block[]): BlockRulesParsed => {
  const sources = blocks.flatMap((block) =>
    Block.filesOf(block).map((file) =>
      sourceOf({
        block,
        file,
      }),
    ),
  );
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
