import { ProgramError } from '#/kernel/errors';

enum DiagnosticsSettingFailure {
  Malformed = 'diagnostics-setting-malformed',
}

interface DiagnosticsSettingDetails {
  readonly code: DiagnosticsSettingFailure;
  /** each place in the configuration that breaks the shape, by its path */
  readonly problemPaths: readonly string[];
}

class DiagnosticsSettingError extends ProgramError<DiagnosticsSettingDetails> {
  public constructor(details: DiagnosticsSettingDetails) {
    super(
      `${details.problemPaths.join(', ')} must each map a call shape to the index, or the list of indexes, of its text arguments`,
      details,
    );
  }
}

export { DiagnosticsSettingError, DiagnosticsSettingFailure };
