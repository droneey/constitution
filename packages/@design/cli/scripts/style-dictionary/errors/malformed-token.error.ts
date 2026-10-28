// Stryker disable next-line StringLiteral: no caller branches on the code yet, so no behaviour tells a changed one apart
const MALFORMED_TOKEN = 'malformed-token';

/** A token's value is not the shape its type gives it: a defect of the token files, never of a build. */
class MalformedTokenError extends Error {
  public readonly code = MALFORMED_TOKEN;
  /** as the build writes it */
  public readonly tokenName: string;

  public constructor(tokenName: string) {
    super(`${MALFORMED_TOKEN}: ${tokenName}`);
    this.tokenName = tokenName;
  }
}

export { MalformedTokenError };
