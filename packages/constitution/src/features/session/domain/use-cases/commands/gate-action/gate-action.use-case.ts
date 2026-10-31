import type { ActiveRulesSource } from '../../../contracts';
import type { GateCause, GateTarget, GateVerdict } from '../../../entities';
import { GateCauseKind } from '../../../entities';
import type { GatePorts } from '../shared/gate-verdict';
import { debtRulesOf, uniqueCausesOf, verdictOf } from '../shared/gate-verdict';
import type { TargetRules } from '../shared/owe-rules';
import { rulesOwedBy } from '../shared/owe-rules';

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

const gateAction = (input: GateActionInput): GateVerdict => {
  const owedFor = rulesOwedBy(input);
  const actions = input.targets.map(owedFor);
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
