class ThemeTokenError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'ThemeTokenError';
  }
}

export { ThemeTokenError };
