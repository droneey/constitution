import type { AbsolutePath } from '#/kernel/value-objects';

enum DebtKind {
  Read = 'read',
  Changed = 'changed',
}

interface RuleDebt {
  readonly kind: DebtKind;
  readonly path: AbsolutePath;
}

export type { RuleDebt };
export { DebtKind };
