import type { RepositoryRelativePath, UnitPath } from '#/kernel/value-objects';

import type { PresetsFinding } from '../../shared/entities';
import type { UnitLock } from './applied-files.entity';
import type { FileComputed } from './file-computed.entity';

interface UnitComputed {
  readonly files: readonly FileComputed[];
  readonly findings: readonly PresetsFinding[];
  readonly lock?: {
    readonly filePath: RepositoryRelativePath;
    readonly next: UnitLock;
  };
  readonly unitPath: UnitPath;
}

export type { UnitComputed };
