import type { ProgramErrorInput } from '#/kernel/errors';
import { ProgramError } from '#/kernel/errors';

enum VersionsFailure {
  /** the site answered with no file */
  Unanswered = 'versions-unanswered',
  /** the site gave no answer in time, or none at all */
  Unreachable = 'versions-unreachable',
  /** the file holds no list of releases */
  Malformed = 'versions-malformed',
}

interface UnansweredDetails {
  readonly address: string;
  readonly status: number;
}

interface UnreachableDetails {
  readonly address: string;
}

interface MalformedDetails {
  readonly address: string;
  /** the path to each value the file got wrong */
  readonly problems: readonly string[];
}

type VersionsErrorInput =
  | ProgramErrorInput<VersionsFailure.Unanswered, UnansweredDetails>
  | ProgramErrorInput<VersionsFailure.Unreachable, UnreachableDetails>
  | ProgramErrorInput<VersionsFailure.Malformed, MalformedDetails>;

/** the list of releases could not be read; the menu then offers the current release alone */
class VersionsError extends ProgramError<VersionsFailure, VersionsErrorInput['details']> {
  public constructor(input: VersionsErrorInput, options?: ErrorOptions) {
    super(input, options);
    // Stryker disable next-line StringLiteral: the name only labels the error in a trace
    this.name = 'VersionsError';
  }
}

export { VersionsError, VersionsFailure };
