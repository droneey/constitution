import type { AppliedFiles } from '../../../../domain/entities';
import type { AppliedFilesCommandRepository } from '../../../contracts/repositories/commands';

interface ApplyChangesInput {
  readonly changes: AppliedFiles;
  readonly writes: AppliedFilesCommandRepository;
}

/** @throws {ApplyError} when a file cannot be written, which leaves every file as it was */
const applyChanges = (input: ApplyChangesInput): void => {
  input.writes.write(input.changes);
};

export type { ApplyChangesInput };
export { applyChanges };
