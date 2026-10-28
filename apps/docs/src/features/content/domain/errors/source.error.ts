import type { ProgramErrorInput } from '#/kernel/errors';
import { ProgramError } from '#/kernel/errors';

enum SourceFailure {
  ChapterListMismatch = 'chapter-list-mismatch',
  ExampleRuleUnknown = 'example-rule-unknown',
  FileMalformed = 'file-malformed',
  ReadmeSectionMissing = 'readme-section-missing',
}

interface ChapterListGaps {
  readonly missing: readonly string[];
  readonly repeated: readonly string[];
  readonly unknown: readonly string[];
}

interface UnknownExampleRules {
  /** the slugs the examples' files are named by, which no rule of the site has */
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
  | ProgramErrorInput<SourceFailure.ExampleRuleUnknown, UnknownExampleRules>
  | ProgramErrorInput<SourceFailure.FileMalformed, MalformedFile>
  | ProgramErrorInput<SourceFailure.ReadmeSectionMissing, MissingSection>;

/** the repository the site builds from holds what the site cannot build: a defect of its files */
class SourceError extends ProgramError<SourceFailure, SourceFailed['details']> {
  public constructor(input: SourceFailed, options?: ErrorOptions) {
    super(input, options);
    // Stryker disable next-line StringLiteral: the name only labels the error in a trace
    this.name = 'SourceError';
  }
}

export type { ChapterListGaps };
export { SourceError, SourceFailure };
