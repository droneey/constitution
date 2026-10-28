import { BranchError, ConfigurationError, MutationRunError } from '#/features/targets';
import { reportLineOf, unexpectedErrorMessage } from '#/kernel/messages';

const isKnownFailure = (error: unknown): error is Error =>
  error instanceof BranchError ||
  error instanceof ConfigurationError ||
  error instanceof MutationRunError;

const failureReportOf = (error: unknown): string =>
  reportLineOf(isKnownFailure(error) ? error.message : unexpectedErrorMessage(error));

export { failureReportOf };
