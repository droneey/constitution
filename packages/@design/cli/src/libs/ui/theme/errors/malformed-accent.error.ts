// Stryker disable next-line StringLiteral: no caller branches on the code yet, so no behaviour tells a changed one apart
const MALFORMED_ACCENT = 'malformed-accent';

class MalformedAccentError extends Error {
  public readonly code = MALFORMED_ACCENT;
  /** keys joined by dots */
  public readonly paths: readonly string[];

  public constructor(paths: readonly string[]) {
    super(`${MALFORMED_ACCENT}: ${paths.join(', ')}`);
    this.paths = paths;
  }
}

export { MalformedAccentError };
