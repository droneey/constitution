import type { Lock } from './lock.entity';

/** A file's new text, by its absolute path. */
interface FileText {
  readonly path: string;
  readonly text: string;
}

/** A unit's new lock, by the unit's absolute folder. */
interface UnitLock {
  readonly folder: string;
  readonly lock: Lock;
}

interface AppliedFiles {
  readonly files: readonly FileText[];
  readonly locks: readonly UnitLock[];
}

export type { AppliedFiles, FileText, UnitLock };
