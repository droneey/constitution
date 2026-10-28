const MALFORMED_ACCENT = 'malformed-accent';

/** An app's brand file that gives no accent scale: a defect of the file. */
class MalformedAccentError extends Error {
  public readonly code = MALFORMED_ACCENT;
  /** each place in the file that holds no scale or no colour in OKLCH, its keys joined by dots */
  public readonly paths: readonly string[];

  public constructor(paths: readonly string[]) {
    super(`${MALFORMED_ACCENT}: ${paths.join(', ')}`);
    this.paths = paths;
  }
}

export { MalformedAccentError };
