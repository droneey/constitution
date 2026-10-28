import type { ProgramErrorInput } from '#/kernel/errors';
import { ProgramError } from '#/kernel/errors';
import type { AbsolutePath } from '#/kernel/value-objects';

enum ApplyFailure {
  /** a file or a lock could not be written, and what the apply had written was put back */
  NotWritten = 'not-written',
}

interface ApplyFailureDetails {
  readonly filePath: AbsolutePath;
}

class ApplyError extends ProgramError<ApplyFailure, ApplyFailureDetails> {
  public constructor(
    input: ProgramErrorInput<ApplyFailure, ApplyFailureDetails>,
    options?: ErrorOptions,
  ) {
    super(input, options);
    this.name = 'ApplyError';
  }
}

const isApplyError = (error: unknown): error is ApplyError => error instanceof ApplyError;

export { ApplyError, ApplyFailure, isApplyError };
