import type { AbsolutePath } from '#/kernel/value-objects';

import type { AgentId } from '../value-objects';

interface ReviewDebt {
  readonly agent: AgentId;
  readonly path: AbsolutePath;
}

const bySubagent = (
  debts: readonly ReviewDebt[],
): readonly {
  readonly agent: AgentId;
  readonly paths: readonly AbsolutePath[];
}[] =>
  [
    ...Map.groupBy(debts, (debt) => debt.agent),
  ].map(([agent, owed]) => ({
    agent,
    paths: owed.map((debt) => debt.path),
  }));

const ReviewDebt = {
  bySubagent,
} as const;

export { ReviewDebt };
