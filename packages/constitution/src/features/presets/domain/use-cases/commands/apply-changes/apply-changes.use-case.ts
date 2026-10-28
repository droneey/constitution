import type { AppliedFilesCommandRepository } from '../../../contracts/repositories/commands';
import type { AppliedFiles } from '../../../entities';

interface ApplyChangesInput {
  readonly changes: AppliedFiles;
  readonly writes: AppliedFilesCommandRepository;
}

/** @throws {@link ApplyError} when a file cannot be written, which leaves every file as it was */
const applyChanges = (input: ApplyChangesInput): void => {
  input.writes.write(input.changes);
};

export type { ApplyChangesInput };
export { applyChanges };
