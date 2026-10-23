import type { ProjectFailure } from '../entities';

// An expected failure to read a project's Constitution: its code says which, path where, and
// line, for a constitution.yaml that does not parse, the line it stops at.
class ProjectError extends Error {
  public override readonly name = 'ProjectError';
  public readonly code: ProjectFailure;
  public readonly line: number | undefined;
  public readonly path: string;

  public constructor(input: {
    code: ProjectFailure;
    line?: number;
    path: string;
  }) {
    super(`${input.code}: ${input.path}`);
    this.code = input.code;
    this.line = input.line;
    this.path = input.path;
  }
}

const isProjectError = (error: unknown): error is ProjectError => error instanceof ProjectError;

export { isProjectError, ProjectError };
