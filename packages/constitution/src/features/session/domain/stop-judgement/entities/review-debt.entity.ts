import type { AbsolutePath } from '#/kernel/value-objects';

import type { AgentId } from '../../session/value-objects';

interface ReviewDebt {
  readonly agent: AgentId;
  readonly path: AbsolutePath;
}

export type { ReviewDebt };
