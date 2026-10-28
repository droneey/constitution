const MALFORMED_TOKEN = 'malformed-token';

class MalformedTokenError extends Error {
  public readonly code = MALFORMED_TOKEN;
  public readonly tokenName: string;

  public constructor(tokenName: string) {
    super(`${MALFORMED_TOKEN}: ${tokenName}`);
    this.tokenName = tokenName;
  }
}

export { MalformedTokenError };
