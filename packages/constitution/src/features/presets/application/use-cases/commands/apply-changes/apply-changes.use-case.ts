import type { AppliedFiles } from '../../../../domain/apply-plan/entities';
import type { AppliedFilesRepository } from '../../../contracts/repositories/commands';

interface ApplyChangesInput {
  readonly appliedFilesRepository: AppliedFilesRepository;
  readonly changes: AppliedFiles;
}

/** @throws {ApplyError} when a file cannot be written, which leaves every file as it was */
const applyChanges = (input: ApplyChangesInput): void => {
  input.appliedFilesRepository.write(input.changes);
};

export type { ApplyChangesInput };
export { applyChanges };
