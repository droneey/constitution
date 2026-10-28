import type { AppliedFiles } from '../../../entities';

interface AppliedFilesCommandRepository {
  /**
   * Writes every file and lock, or none: what it wrote before a failure is put back.
   *
   * @throws {@link ApplyError} when a file cannot be written
   */
  readonly write: (applied: AppliedFiles) => void;
}

export type { AppliedFilesCommandRepository };
