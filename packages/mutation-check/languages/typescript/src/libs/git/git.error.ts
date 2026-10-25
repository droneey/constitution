enum GitFailure {
  NotRun = 'git-not-run',
  Failed = 'git-failed',
}

interface GitFailureDetails {
  readonly args: readonly string[];
  readonly folder: string;
  readonly stderr?: string;
}

class GitError extends Error {
  public readonly code: GitFailure;
  public readonly details: GitFailureDetails;

  public constructor(input: {
    cause?: unknown;
    code: GitFailure;
    details: GitFailureDetails;
  }) {
    const command = `git ${input.details.args.join(' ')} failed in ${input.details.folder}`;

    super(input.details.stderr === undefined ? command : `${command}: ${input.details.stderr}`, {
      cause: input.cause,
    });
    this.name = 'GitError';
    this.code = input.code;
    this.details = input.details;
  }
}

const isGitError = (error: unknown): error is GitError => error instanceof GitError;

export { GitError, GitFailure, isGitError };
