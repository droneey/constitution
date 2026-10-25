import { ProgramError } from '#/kernel/errors';

enum ExportFailure {
  Unavailable = 'export-unavailable',
}

interface UnavailableDetails {
  readonly address: string;
}

/** a file the site's server exported for the browser could not be read: the site gave none, or none it could read */
class ExportError extends ProgramError<ExportFailure, UnavailableDetails> {
  public constructor(details: UnavailableDetails, options?: ErrorOptions) {
    super(
      {
        code: ExportFailure.Unavailable,
        details,
      },
      options,
    );
    // Stryker disable next-line StringLiteral: the name only labels the error in a trace
    this.name = 'ExportError';
  }
}

export { ExportError, ExportFailure };
