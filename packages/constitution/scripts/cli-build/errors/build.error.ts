import type { ProgramErrorInput } from '#/kernel/errors';
import { ProgramError } from '#/kernel/errors';

enum BuildFailure {
  TargetUnknown = 'target-unknown',
  PluginUnreadable = 'plugin-unreadable',
  CompilerGaveNothing = 'compiler-gave-nothing',
}

interface BuildInput {
  readonly given: string;
}

class BuildError extends ProgramError<BuildFailure, BuildInput> {
  public constructor(input: ProgramErrorInput<BuildFailure, BuildInput>) {
    super(input);
    this.name = 'BuildError';
  }
}

const isBuildError = (error: unknown): error is BuildError => error instanceof BuildError;

export { BuildError, BuildFailure, isBuildError };
