import type { ProgramErrorInput } from '#/kernel/errors';
import { ProgramError } from '#/kernel/errors';

enum ApplyFailure {
  /** a file or a lock could not be written, and what the apply had written was put back */
  NotWritten = 'not-written',
}

interface ApplyFailureDetails {
  readonly path: string;
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
