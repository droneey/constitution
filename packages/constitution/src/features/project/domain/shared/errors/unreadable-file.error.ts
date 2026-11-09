import type { ProgramErrorInput } from '#/kernel/errors';
import { ProgramError } from '#/kernel/errors';
import type { AbsolutePath } from '#/kernel/value-objects';

enum UnreadableFileFailure {
  Config = 'config-unreadable',
  Core = 'core-unreadable',
}

interface UnreadableFileDetails {
  readonly path: AbsolutePath;
}

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
