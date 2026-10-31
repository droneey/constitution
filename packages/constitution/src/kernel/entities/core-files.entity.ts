import type { UnitPath } from '../value-objects';
import type { SourcedFile } from './sourced-file.entity';

interface CoreFiles {
  readonly files: readonly SourcedFile[];
  readonly unit: UnitPath;
}

export type { CoreFiles };
