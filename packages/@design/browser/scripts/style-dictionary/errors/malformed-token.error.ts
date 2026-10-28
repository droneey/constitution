const MALFORMED_TOKEN = 'malformed-token';

/** A token is not the shape the build reads — a value not the shape its type gives it, a style of text with no kind or in another family than the rest of its kind, or a primitive the build names that is missing — a defect of the token files, never of a build. */
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
