import type { AppliedFilesCommandRepository } from '../domain/contracts/repositories/commands';
import type { AppliedFiles } from '../domain/entities';

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
