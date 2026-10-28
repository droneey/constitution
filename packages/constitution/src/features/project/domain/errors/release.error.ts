import type { ProgramErrorInput } from '#/kernel/errors';
import { ProgramError } from '#/kernel/errors';
import type { AbsolutePath } from '#/kernel/value-objects';

enum ReleaseFailure {
  BlocksUnlisted = 'blocks-unlisted',
}

interface ReleaseFailureDetails {
  /** the release's folder */
  readonly path: AbsolutePath;
}

/** The release a project pins is not installed as a release installs itself. */
class ReleaseError extends ProgramError<ReleaseFailure, ReleaseFailureDetails> {
  public constructor(input: ProgramErrorInput<ReleaseFailure, ReleaseFailureDetails>) {
    super(input);
    this.name = 'ReleaseError';
  }
}

export { ReleaseError, ReleaseFailure };
