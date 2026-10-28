import type { ProgramErrorInput } from '#/kernel/errors';
import { ProgramError } from '#/kernel/errors';

enum VersionsFailure {
  Unreachable = 'versions-unreachable',
  NoFile = 'versions-no-file',
  Malformed = 'versions-malformed',
}

interface VersionsAddress {
  readonly address: string;
}

interface VersionsAnswer extends VersionsAddress {
  readonly status: number;
}

interface MalformedVersions extends VersionsAddress {
  /** the path to each value the file got wrong, the empty path for the whole file */
  readonly problems: readonly string[];
}

type VersionsFailed =
  | ProgramErrorInput<VersionsFailure.Unreachable, VersionsAddress>
  | ProgramErrorInput<VersionsFailure.NoFile, VersionsAnswer>
  | ProgramErrorInput<VersionsFailure.Malformed, MalformedVersions>;

class VersionsError extends ProgramError<VersionsFailure, VersionsFailed['details']> {
  public constructor(input: VersionsFailed, options?: ErrorOptions) {
    super(input, options);
    // Stryker disable next-line StringLiteral: the name only labels the error in a trace
    this.name = 'VersionsError';
  }
}

export { VersionsError, VersionsFailure };
