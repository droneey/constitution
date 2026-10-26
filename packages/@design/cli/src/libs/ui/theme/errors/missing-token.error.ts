// Stryker disable next-line StringLiteral: no caller branches on the code yet, so no behaviour tells a changed one apart
const MISSING_TOKEN = 'missing-token';

/**
 * The generated theme holds no value for a token the theme reads: a defect of the generation, never
 * of a run.
 */
class MissingTokenError extends Error {
  public readonly code = MISSING_TOKEN;
  /** the token's name, as the tokens' generation writes it */
  public readonly token: string;

  public constructor(token: string) {
    // Stryker disable next-line StringLiteral: the text of a diagnostic, which no caller reads
    super(`${MISSING_TOKEN}: ${token}`);
    this.token = token;
  }
}

export { MissingTokenError };
