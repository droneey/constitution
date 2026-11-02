import type { ActiveRulesSource } from '../../../contracts';
import type { GateCause, GateTarget, GateVerdict } from '../../../entities';
import { GateCauseKind, TargetKind } from '../../../entities';
import type { GatePorts } from '../shared/gate-verdict';
import { debtRulesOf, uniqueCausesOf, verdictOf } from '../shared/gate-verdict';
import type { TargetRules } from '../shared/owe-rules';
import { rulesOwedBy } from '../shared/owe-rules';
import { unignoredFilesAmong } from '../shared/unignored-files';

interface GateActionInput extends GatePorts {
  readonly source: ActiveRulesSource;
  readonly targets: readonly GateTarget[];
}

const closingCausesOf = (actions: readonly TargetRules[]): readonly GateCause[] => {
  const editedFiles = new Set(actions.map((owed) => owed.realPath));

  return uniqueCausesOf(actions.flatMap((owed) => owed.causes)).filter((cause) => {
    // Stryker disable next-line ConditionalExpression,BlockStatement: only an unparsed cause has a config, so its kind check only narrows the type
    if (cause.kind !== GateCauseKind.Unparsed) {
      return true;
    }

    return !editedFiles.has(cause.config);
  });
};

// Why: an edit of a file git ignores owes no rule, while a command's folder is gated whatever git
// says of it, and the debts the agent carries still hold it.
const isGoverned = (input: GateActionInput, target: GateTarget): boolean =>
  target.kind !== TargetKind.File ||
  unignoredFilesAmong({
    paths: [
      input.source.realPathOf(target.path),
    ],
    source: input.source,
    workingTree: input.workingTree,
  }).length > 0;

const gateAction = (input: GateActionInput): GateVerdict => {
  const owedFor = rulesOwedBy(input);
  const actions = input.targets.filter((target) => isGoverned(input, target)).map(owedFor);
  const debts = debtRulesOf({
    ...input,
    owedFor,
  });

  return verdictOf({
    ...input,
    closing: closingCausesOf(actions),
    debts,
    owed: [
      ...actions,
      ...debts.map((debt) => debt.owed),
    ],
  });
};

export { gateAction };
