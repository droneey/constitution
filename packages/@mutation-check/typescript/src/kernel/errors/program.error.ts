interface ProgramFailureDetails {
  readonly code: string;
}

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
