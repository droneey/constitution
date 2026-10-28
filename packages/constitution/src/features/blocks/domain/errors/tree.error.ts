import type { ProgramErrorInput } from '#/kernel/errors';
import { ProgramError } from '#/kernel/errors';
import type { AbsolutePath } from '#/kernel/value-objects';

enum TreeFailure {
  Failed = 'failed',
  TimedOut = 'timed-out',
  Unreadable = 'unreadable',
  TooLarge = 'too-large',
}

interface TreeFailureDetails {
  readonly path: AbsolutePath;
}

class TreeError extends ProgramError<TreeFailure, TreeFailureDetails> {
  public constructor(
    input: ProgramErrorInput<TreeFailure, TreeFailureDetails>,
    options?: ErrorOptions,
  ) {
    super(input, options);
    this.name = 'TreeError';
  }
}

const isTreeError = (error: unknown): error is TreeError => error instanceof TreeError;

export { isTreeError, TreeError, TreeFailure };
