import type { AbsolutePath } from '#/kernel/value-objects';

import type { GateCause } from './gate-cause.entity';

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
      readonly unreadCount: number;
    }
  | {
      readonly changedByCommands: readonly AbsolutePath[];
      readonly kind: GateVerdictKind.Refused;
      readonly parts: readonly AbsolutePath[];
      readonly shouldIgnoreParts: boolean;
      readonly unreadCount: number;
    };

export type { GateVerdict };
export { GateVerdictKind };
