interface ProgramErrorInput<TCode extends string, TDetails extends object> {
  readonly code: TCode;
  readonly details: TDetails;
}

/**
 * The base of every error the program declares: a stable code a caller branches on, the details
 * that say what failed, and, where it maps another failure, that failure as its cause.
 */
class ProgramError<TCode extends string, TDetails extends object> extends Error {
  public readonly code: TCode;
  public readonly details: Readonly<TDetails>;

  public constructor(input: ProgramErrorInput<TCode, TDetails>, options?: ErrorOptions) {
    // Stryker disable next-line StringLiteral: the message only describes the failure to a reader, who branches on the code
    super(`${input.code}: ${JSON.stringify(input.details)}`, options);
    this.code = input.code;
    this.details = input.details;
  }
}

export type { ProgramErrorInput };
export { ProgramError };
