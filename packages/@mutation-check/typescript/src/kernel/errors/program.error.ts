interface ProgramFailureDetails {
  readonly code: string;
}

/**
 * The base of every error the program declares: the message its user reads, what failed and what to
 * do next, and a stable code a caller branches on, with its details.
 */
class ProgramError<TDetails extends ProgramFailureDetails> extends Error {
  public readonly code: TDetails['code'];
  public readonly details: TDetails;

  public constructor(message: string, details: TDetails, options?: ErrorOptions) {
    super(message, options);
    this.name = new.target.name;
    this.code = details.code;
    this.details = details;
  }
}

export { ProgramError };
