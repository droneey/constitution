interface ProgramErrorInput<TCode extends string, TDetails extends object> {
  readonly code: TCode;
  readonly details: TDetails;
}

class ProgramError<TCode extends string, TDetails extends object> extends Error {
  public readonly code: TCode;
  public readonly details: Readonly<TDetails>;

  public constructor(input: ProgramErrorInput<TCode, TDetails>, options?: ErrorOptions) {
    super(`${input.code}: ${JSON.stringify(input.details)}`, options);
    this.code = input.code;
    this.details = input.details;
  }
}

const isProgramError = (error: unknown): error is ProgramError<string, object> =>
  error instanceof ProgramError;

export type { ProgramErrorInput };
export { isProgramError, ProgramError };
