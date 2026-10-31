import type { ActiveRulesSource } from '../../../contracts';
import type { GateVerdict } from '../../../entities';
import { GateVerdictKind } from '../../../entities';
import type { GatePorts } from '../shared/gate-verdict';
import { debtRulesOf, uniqueCausesOf, verdictOf } from '../shared/gate-verdict';
import { rulesOwedBy } from '../shared/owe-rules';

interface GateTurnInput extends GatePorts {
  readonly isHookActive: boolean;
  readonly source: ActiveRulesSource;
}

const gateTurn = (input: GateTurnInput): GateVerdict => {
  if (input.isHookActive) {
    return {
      kind: GateVerdictKind.Allowed,
    };
  }

  const debts = debtRulesOf({
    ...input,
    owedFor: rulesOwedBy(input),
  });

  return verdictOf({
    ...input,
    closing: uniqueCausesOf(debts.flatMap((debt) => debt.owed.causes)),
    debts,
    owed: debts.map((debt) => debt.owed),
  });
};

export { gateTurn };
