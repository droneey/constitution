import type { ProgramErrorInput } from './program.error';
import { ProgramError } from './program.error';

enum WorkingTreeFailure {
  GitFailed = 'git-failed',
}

interface GitStderr {
  /** what git wrote of its error, as it wrote it */
  readonly stderr: string;
}

/** git ran and failed, so the working tree's state is unknown. */
class WorkingTreeError extends ProgramError<WorkingTreeFailure, GitStderr> {
  public constructor(input: ProgramErrorInput<WorkingTreeFailure, GitStderr>) {
    super(input);
    this.name = 'WorkingTreeError';
  }
}

const isWorkingTreeError = (error: unknown): error is WorkingTreeError =>
  error instanceof WorkingTreeError;

export { isWorkingTreeError, WorkingTreeError, WorkingTreeFailure };
