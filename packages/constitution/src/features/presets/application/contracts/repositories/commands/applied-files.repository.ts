import type { AppliedFiles } from '../../../../domain/apply-plan/entities';

interface AppliedFilesRepository {
  /** @throws {ApplyError} when a file cannot be written */
  readonly write: (applied: AppliedFiles) => void;
}

export type { AppliedFilesRepository };
