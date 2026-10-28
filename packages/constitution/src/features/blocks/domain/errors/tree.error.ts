import type { ProgramErrorInput } from '#/kernel/errors';
import { ProgramError } from '#/kernel/errors';
import type { AbsolutePath } from '#/kernel/value-objects';

enum TreeFailure {
  Failed = 'failed',
  TimedOut = 'timed-out',
  Unreadable = 'unreadable',
  /** the installed Constitution's blocks folder holds more files than any release does */
  TooLarge = 'too-large',
}

interface TreeFailureDetails {
  /** the folder of the tree, or the file that cannot be read */
  readonly path: AbsolutePath;
}

/** An expected failure to list or read the files of a tree. */
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
