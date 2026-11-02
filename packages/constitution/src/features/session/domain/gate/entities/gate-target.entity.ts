import type { AbsolutePath } from '#/kernel/value-objects';

enum TargetKind {
  File = 'file',
  Folder = 'folder',
}

interface GateTarget {
  readonly kind: TargetKind;
  readonly path: AbsolutePath;
}

export type { GateTarget };
export { TargetKind };
