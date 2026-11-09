import type { AbsolutePath } from '#/kernel/value-objects';

enum GateCauseKind {
  Unparsed = 'unparsed',
  NoRelease = 'no-release',
  Unreadable = 'unreadable',
  Failed = 'failed',
  Unwritable = 'unwritable',
}

type GateCause =
  | {
      readonly config: AbsolutePath;
      readonly kind: GateCauseKind.Unparsed;
      readonly lines: readonly number[];
    }
  | {
      readonly kind: GateCauseKind.NoRelease;
      readonly releaseFolderPath: AbsolutePath;
    }
  | {
      readonly file: AbsolutePath;
      readonly kind: GateCauseKind.Unreadable;
    }
  | {
      readonly kind: GateCauseKind.Failed;
      readonly reason: string;
    }
  | {
      readonly folder: AbsolutePath;
      readonly kind: GateCauseKind.Unwritable;
    };

const keyOf = (cause: GateCause): string => JSON.stringify(cause);

const GateCause = {
  keyOf,
} as const;

export { GateCause, GateCauseKind };
