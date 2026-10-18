/** a token source the theme cannot be built from: a reference to no token, or a value of the wrong kind */
class ThemeTokenError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'ThemeTokenError';
  }
}

export { ThemeTokenError };
