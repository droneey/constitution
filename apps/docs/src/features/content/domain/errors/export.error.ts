import type { ProgramErrorInput } from '#/kernel/errors';
import { ProgramError } from '#/kernel/errors';

enum ExportFailure {
  Unreachable = 'export-unreachable',
  NoFile = 'export-no-file',
  Malformed = 'export-malformed',
}

interface ExportAddress {
  readonly address: string;
}

interface ExportAnswer extends ExportAddress {
  readonly status: number;
}

interface MalformedExport extends ExportAddress {
  readonly problems: readonly string[];
}

type ExportFailed =
  | ProgramErrorInput<ExportFailure.Unreachable, ExportAddress>
  | ProgramErrorInput<ExportFailure.NoFile, ExportAnswer>
  | ProgramErrorInput<ExportFailure.Malformed, MalformedExport>;

class ExportError extends ProgramError<ExportFailure, ExportFailed['details']> {
  public constructor(input: ExportFailed, options?: ErrorOptions) {
    super(input, options);
    // Stryker disable next-line StringLiteral: the name only labels the error in a trace
    this.name = 'ExportError';
  }
}

export { ExportError, ExportFailure };
