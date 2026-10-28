import type { ProgramErrorInput } from '#/kernel/errors';
import { ProgramError } from '#/kernel/errors';
import type { AbsolutePath } from '#/kernel/value-objects';

/** Each file of a project's Constitution the program must read. */
enum UnreadableFileFailure {
  Config = 'config-unreadable',
  Core = 'core-unreadable',
}

interface UnreadableFileDetails {
  readonly path: AbsolutePath;
}

/** A file of a project's Constitution is missing or cannot be read; its cause says which. */
class UnreadableFileError extends ProgramError<UnreadableFileFailure, UnreadableFileDetails> {
  public constructor(
    input: ProgramErrorInput<UnreadableFileFailure, UnreadableFileDetails>,
    options?: ErrorOptions,
  ) {
    super(input, options);
    this.name = 'UnreadableFileError';
  }
}

export { UnreadableFileError, UnreadableFileFailure };
