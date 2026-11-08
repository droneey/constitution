import type { ProgramErrorInput } from '#/kernel/errors';
import { ProgramError } from '#/kernel/errors';

enum SourceFailure {
  ChapterListMismatch = 'chapter-list-mismatch',
  ExampleInRule = 'example-in-rule',
  ExampleRuleUnknown = 'example-rule-unknown',
  FileMalformed = 'file-malformed',
  ReadmeSectionMissing = 'readme-section-missing',
}

interface ChapterListGaps {
  readonly missing: readonly string[];
  readonly repeated: readonly string[];
  readonly unknown: readonly string[];
}

interface ExampleRules {
  readonly slugs: readonly string[];
}

interface MalformedFile {
  readonly path: string;
}

interface MissingSection {
  readonly path: string;
  readonly section: string;
}

type SourceFailed =
  | ProgramErrorInput<SourceFailure.ChapterListMismatch, ChapterListGaps>
  | ProgramErrorInput<SourceFailure.ExampleInRule, ExampleRules>
  | ProgramErrorInput<SourceFailure.ExampleRuleUnknown, ExampleRules>
  | ProgramErrorInput<SourceFailure.FileMalformed, MalformedFile>
  | ProgramErrorInput<SourceFailure.ReadmeSectionMissing, MissingSection>;

class SourceError extends ProgramError<SourceFailure, SourceFailed['details']> {
  public constructor(input: SourceFailed, options?: ErrorOptions) {
    super(input, options);
    // Stryker disable next-line StringLiteral: the name only labels the error in a trace
    this.name = 'SourceError';
  }
}

export type { ChapterListGaps };
export { SourceError, SourceFailure };
