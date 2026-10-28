export { ExitCode } from './app/constants';
export { runCheckMutations } from './app/use-cases';
export type {
  Branch,
  BranchReader,
  CodeComparer,
  MutationRunner,
} from './domain/contracts';
export type { ChangedFile, MutationTarget } from './domain/entities';
export {
  BranchError,
  BranchFailure,
  ConfigurationError,
  ConfigurationFailure,
  MutationRunError,
  MutationRunFailure,
} from './domain/errors';
export { checkMutations } from './domain/use-cases';
