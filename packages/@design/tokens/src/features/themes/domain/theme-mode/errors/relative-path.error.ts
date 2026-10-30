// Stryker disable next-line StringLiteral: no caller branches on the code yet, so no behaviour tells a changed one apart
const PATH_NOT_ABSOLUTE = 'path-not-absolute';

class RelativePathError extends Error {
  public readonly code = PATH_NOT_ABSOLUTE;
  public readonly text: string;

  public constructor(text: string) {
    // Stryker disable next-line StringLiteral: the text of a diagnostic, which no caller reads
    super(`${PATH_NOT_ABSOLUTE}: ${text}`);
    this.text = text;
  }
}

export { RelativePathError };
