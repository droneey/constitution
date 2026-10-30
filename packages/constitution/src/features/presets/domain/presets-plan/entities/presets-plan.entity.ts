import type {
  BlockId,
  RepositoryRelativePath,
  UnitPath,
  UnitRelativePath,
} from '#/kernel/value-objects';

import type { BlockMarks } from '../../configuration-file/entities';
import type { MergedFile } from '../../merged-file/entities';
import type { PresetEntry } from '../../preset-entry/entities';
import type { UnitRun } from '../../run-plan/entities';
import type { PresetsFinding } from '../../shared/entities';
import type { FileFormat } from '../../shared/value-objects';

interface FilePlan {
  readonly entries: readonly PresetEntry[];
  readonly filePath: RepositoryRelativePath;
  readonly format?: FileFormat;
  readonly marks?: BlockMarks;
  readonly merged: MergedFile;
  readonly unitPath: UnitPath;
}

interface PresetsPlan {
  readonly blockIds: ReadonlyMap<UnitRelativePath, readonly BlockId[]>;
  readonly files: readonly FilePlan[];
  readonly findings: readonly PresetsFinding[];
  readonly runs: readonly UnitRun[];
}

export type { FilePlan, PresetsPlan };
