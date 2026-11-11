import type { BlockId, RuleSlug, UnitPath } from '../value-objects';

interface WholeHold {
  readonly isEveryLanguage: boolean;
  readonly languages: ReadonlySet<BlockId>;
}

type WholeHolds = ReadonlyMap<UnitPath, ReadonlyMap<RuleSlug, WholeHold>>;

export type { WholeHold, WholeHolds };
