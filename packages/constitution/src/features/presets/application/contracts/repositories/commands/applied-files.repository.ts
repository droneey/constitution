import type { AppliedFiles } from '../../../../domain/apply-plan/entities';

interface AppliedFilesCommandRepository {
  /** @throws {ApplyError} when a file cannot be written */
  readonly write: (applied: AppliedFiles) => void;
}

export type { AppliedFilesCommandRepository };
