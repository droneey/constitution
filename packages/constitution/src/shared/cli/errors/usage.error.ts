import type { ProgramErrorInput } from '#/kernel/errors';
import { ProgramError } from '#/kernel/errors';

enum UsageFailure {
  OptionsUnparsed = 'options-unparsed',
}

interface UsageProblems {
  readonly problems: readonly string[];
}

class UsageError extends ProgramError<UsageFailure, UsageProblems> {
  public constructor(input: ProgramErrorInput<UsageFailure, UsageProblems>) {
    super(input);
    this.name = 'UsageError';
  }
}

const isUsageError = (error: unknown): error is UsageError => error instanceof UsageError;

export { isUsageError, UsageError, UsageFailure };
