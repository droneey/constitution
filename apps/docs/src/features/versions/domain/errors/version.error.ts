import { ProgramError } from '#/kernel/errors';

enum VersionFailure {
  NotSemantic = 'version-not-semantic',
}

interface RefusedText {
  readonly text: string;
}

/** a version that is no release's `<major>.<minor>.<patch>` */
class VersionError extends ProgramError<VersionFailure, RefusedText> {
  public constructor(details: RefusedText) {
    super({
      code: VersionFailure.NotSemantic,
      details,
    });
    // Stryker disable next-line StringLiteral: the name only labels the error in a trace
    this.name = 'VersionError';
  }
}

export { VersionError };
