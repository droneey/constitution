import type { ProjectError } from '#/features/constitution';
import { isProjectError, ProjectFailure } from '#/features/constitution';

import { ExitCode } from './exit-codes';

const ISSUES = 'https://github.com/droneey/constitution/issues';

const messageOf = (error: ProjectError): string => {
  const messages: Readonly<Record<ProjectFailure, string>> = {
    [ProjectFailure.ArchiveMissing]: `${error.path} does not exist — run mise install`,
    [ProjectFailure.BlocksUnlisted]: `cannot list the blocks of ${error.path}`,
    [ProjectFailure.ConfigUnparsed]: `constitution.yaml does not parse at line ${String(error.line ?? 0)}`,
    [ProjectFailure.ConfigUnreadable]: `cannot read ${error.path}`,
    [ProjectFailure.CoreUnreadable]: 'cannot build the digest',
    [ProjectFailure.ManifestUnreadable]: `cannot read ${error.path}`,
    [ProjectFailure.NoProject]: 'no constitution.yaml in this folder or above it',
    [ProjectFailure.VersionMissing]: `${error.path} has no version`,
  };

  return messages[error.code];
};

interface ErrorHandler {
  // whether a command's work has started: bunli's own usage failures come before it
  readonly hasStarted: () => boolean;
  readonly run: (input: { prefix: string; work: () => Promise<void> | void }) => Promise<void>;
}

// The handler of last resort: a failure the program foresees ends the run with its line and the
// code the user can act on, any other with the code of a defect.
const createErrorHandler = (input: {
  setExitCode: (code: ExitCode) => void;
  writeError: (text: string) => void;
}): ErrorHandler => {
  let hasStarted = false;

  return {
    hasStarted: (): boolean => hasStarted,
    run: async (command: { prefix: string; work: () => Promise<void> | void }): Promise<void> => {
      hasStarted = true;

      try {
        await command.work();
      } catch (error) {
        if (isProjectError(error)) {
          input.writeError(`${command.prefix}: ${messageOf(error)}\n`);
          input.setExitCode(ExitCode.Failure);

          return;
        }

        input.writeError(
          `${command.prefix}: the run stopped on an error of its own; report it at ${ISSUES}\n`,
        );
        input.setExitCode(ExitCode.Defect);
      }
    },
  };
};

export type { ErrorHandler };
export { createErrorHandler };
