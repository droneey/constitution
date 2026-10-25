import type { ActiveBlock, MustRule } from '#/kernel/entities';
import type { UnitPath } from '#/kernel/value-objects';

import type { CheckState } from './check-state.entity';

/** What a session keeps for the hooks that follow its start; its units, the repository's first. */
interface SessionState {
  readonly active: readonly ActiveBlock[];
  readonly check: CheckState;
  readonly musts: readonly MustRule[];
  readonly project: string;
  readonly units: readonly UnitPath[];
}

const SessionState = {
  create: (input: SessionState): SessionState => ({
    active: input.active,
    check: input.check,
    musts: input.musts,
    project: input.project,
    units: input.units,
  }),
} as const;

export { SessionState };
