import type { ProgramErrorInput } from './program.error';
import { ProgramError } from './program.error';

/** Why a project's Constitution cannot be read, each failure naming the path it stopped at. */
enum ProjectFailure {
  NoProject = 'no-project',
  ReleaseMissing = 'distribution-missing',
  ManifestUnreadable = 'manifest-unreadable',
  VersionMissing = 'version-missing',
  ConfigUnreadable = 'config-unreadable',
  ConfigUnparsed = 'config-unparsed',
  BlocksUnlisted = 'blocks-unlisted',
  CoreUnreadable = 'core-unreadable',
}

interface ProjectFailureDetails {
  /** where constitution.yaml stops parsing */
  readonly line?: number;
  readonly path: string;
}

/** An expected failure to read a project's Constitution. */
class ProjectError extends ProgramError<ProjectFailure, ProjectFailureDetails> {
  public constructor(
    input: ProgramErrorInput<ProjectFailure, ProjectFailureDetails>,
    options?: ErrorOptions,
  ) {
    super(input, options);
    this.name = 'ProjectError';
  }
}

const isProjectError = (error: unknown): error is ProjectError => error instanceof ProjectError;

export { isProjectError, ProjectError, ProjectFailure };
