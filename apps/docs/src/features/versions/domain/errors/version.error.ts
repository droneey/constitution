class VersionError extends Error {
  public readonly text: string;

  public constructor(text: string) {
    super(text);
    this.text = text;
  }
}

export { VersionError };
