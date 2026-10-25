import type { ProgramErrorInput } from '#/kernel/errors';
import { ProgramError } from '#/kernel/errors';

enum UsageFailure {
  OptionsUnparsed = 'options-unparsed',
}

interface UsageProblems {
  /** each as "<option>: <what is wrong>" */
  readonly problems: readonly string[];
}

/** A command line the program cannot take, past what commander itself refuses. */
class UsageError extends ProgramError<UsageFailure, UsageProblems> {
  public constructor(input: ProgramErrorInput<UsageFailure, UsageProblems>) {
    super(input);
    this.name = 'UsageError';
  }
}

const isUsageError = (error: unknown): error is UsageError => error instanceof UsageError;

export { isUsageError, UsageError, UsageFailure };
