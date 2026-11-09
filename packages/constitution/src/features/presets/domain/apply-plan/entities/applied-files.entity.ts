import type { AbsolutePath } from '#/kernel/value-objects';

import type { Lock } from '../../lock/entities';

interface FileText {
  readonly filePath: AbsolutePath;
  readonly text: string;
}

interface UnitLock {
  readonly lock: Lock;
  readonly unitFolderPath: AbsolutePath;
}

interface AppliedFiles {
  readonly deletedFilePaths: readonly AbsolutePath[];
  readonly files: readonly FileText[];
  readonly locks: readonly UnitLock[];
}

export type { AppliedFiles, FileText, UnitLock };
