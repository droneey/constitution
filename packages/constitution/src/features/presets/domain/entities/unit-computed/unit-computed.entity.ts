import type { RepositoryRelativePath, UnitPath } from '#/kernel/value-objects';

import type { UnitLock } from '../applied-files/applied-files.entity';
import type { FileComputed } from '../file-computed/file-computed.entity';
import type { PresetsFinding } from '../presets-finding/presets-finding.entity';

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
