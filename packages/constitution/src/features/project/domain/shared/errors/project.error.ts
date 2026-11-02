import { ReleaseError } from './release.error';
import { UnreadableFileError } from './unreadable-file.error';

type ProjectError = ReleaseError | UnreadableFileError;

const isProjectError = (error: unknown): error is ProjectError =>
  error instanceof ReleaseError || error instanceof UnreadableFileError;

export type { ProjectError };
export { isProjectError };
