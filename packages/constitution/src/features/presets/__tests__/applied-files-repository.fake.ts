import type { AppliedFilesRepository } from '../application/contracts/repositories/commands';
import type { AppliedFiles } from '../domain/apply-plan/entities';

const createFakeAppliedFilesRepository = (
  failure?: Error,
): {
  readonly appliedFilesRepository: AppliedFilesRepository;
  readonly written: () => readonly AppliedFiles[];
} => {
  const written: AppliedFiles[] = [];

  return {
    appliedFilesRepository: {
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
