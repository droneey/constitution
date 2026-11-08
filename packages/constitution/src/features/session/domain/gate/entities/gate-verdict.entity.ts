import type { AbsolutePath } from '#/kernel/value-objects';

import type { GateCause } from './gate-cause.entity';
import type { ReadingCount } from './owed-reading.entity';

enum GateVerdictKind {
  Allowed = 'allowed',
  Closed = 'closed',
  PassedClosed = 'passed-closed',
  PassedUnread = 'passed-unread',
  Refused = 'refused',
}

type GateVerdict =
  | {
      readonly kind: GateVerdictKind.Allowed;
    }
  | {
      readonly causes: readonly GateCause[];
      readonly kind: GateVerdictKind.Closed | GateVerdictKind.PassedClosed;
    }
  | {
      readonly kind: GateVerdictKind.PassedUnread;
      readonly unread: ReadingCount;
    }
  | {
      readonly changedByCommands: readonly AbsolutePath[];
      readonly kind: GateVerdictKind.Refused;
      readonly parts: readonly AbsolutePath[];
      readonly shouldIgnoreParts: boolean;
      readonly unread: ReadingCount;
    };

export type { GateVerdict };
export { GateVerdictKind };
