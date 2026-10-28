// Stryker disable next-line StringLiteral: no caller branches on the code yet, so no behaviour tells a changed one apart
const DEFAULT_MODE_UNKNOWN = 'default-mode-unknown';

/** A defect of the tokens: their `theme` modifier names a default it has no context for. */
class UnknownDefaultModeError extends Error {
  public readonly code = DEFAULT_MODE_UNKNOWN;
  public readonly modeName: string;

  public constructor(modeName: string) {
    super(
      `the theme modifier of the tokens names the default ${modeName}, which is none of its contexts`,
    );
    this.modeName = modeName;
  }
}

export { UnknownDefaultModeError };
