// Stryker disable next-line StringLiteral: no caller branches on the code yet, so no behaviour tells a changed one apart
const MALFORMED_TOKEN = 'malformed-token';

/** A token's value is not the shape its type gives it: a defect of the token files, never of a build. */
class MalformedTokenError extends Error {
  public readonly code = MALFORMED_TOKEN;
  /** the token's name, as the build writes it */
  public readonly token: string;

  public constructor(token: string) {
    // Stryker disable next-line StringLiteral: the text of a diagnostic, which no caller reads
    super(`${MALFORMED_TOKEN}: ${token}`);
    this.token = token;
  }
}

export { MalformedTokenError };
