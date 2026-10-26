import type { AppliedFilesCommandRepository } from '../domain/contracts/repositories/commands';
import type { AppliedFiles } from '../domain/entities';

/** The writes an apply asks for, kept in order; a failure given is thrown at the first write. */
const createFakeAppliedFilesRepository = (
  failure?: Error,
): {
  readonly repository: AppliedFilesCommandRepository;
  readonly written: () => readonly AppliedFiles[];
} => {
  const written: AppliedFiles[] = [];

  return {
    repository: {
      write: (applied: AppliedFiles): void => {
        if (failure !== undefined) {
          throw failure;
        }

        written.push(applied);
      },
    },
    written: () => written,
  };
};

export { createFakeAppliedFilesRepository };
