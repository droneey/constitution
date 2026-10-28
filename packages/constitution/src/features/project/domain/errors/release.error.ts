import type { ProgramErrorInput } from '#/kernel/errors';
import { ProgramError } from '#/kernel/errors';
import type { AbsolutePath } from '#/kernel/value-objects';

enum ReleaseFailure {
  BlocksUnlisted = 'blocks-unlisted',
}

interface ReleaseFailureDetails {
  readonly path: AbsolutePath;
}

class ReleaseError extends ProgramError<ReleaseFailure, ReleaseFailureDetails> {
  public constructor(input: ProgramErrorInput<ReleaseFailure, ReleaseFailureDetails>) {
    super(input);
    this.name = 'ReleaseError';
  }
}

export { ReleaseError, ReleaseFailure };
