import type { CheckMutations } from '../../../../application/use-cases';
import { CheckScope, CheckStatus } from '../../../../domain/entities';
import { ExitCode } from '../../../constants';
import { nothingChangedMessage, unknownArgumentsMessage } from './check-mutations.messages.ts';

interface CheckMutationsCommandInput {
  readonly args: readonly string[];
  readonly checkMutations: CheckMutations;
  readonly writeError: (text: string) => void;
  readonly writeOutput: (text: string) => void;
}

const EVERYTHING_ARGUMENT = 'all';

const scopeOf = (args: readonly string[]): CheckScope | undefined => {
  if (args.length === 0) {
    return CheckScope.Branch;
  }

  return args.length === 1 && args[0] === EVERYTHING_ARGUMENT ? CheckScope.Everything : undefined;
};

/**
 * @throws {BranchError} when the branch cannot be read
 * @throws {ConfigurationError} when the configuration cannot tell which files it mutates
 * @throws {MutationRunError} when the mutation tool does not run to its end
 */
const runCheckMutations = async (input: CheckMutationsCommandInput): Promise<number> => {
  const scope = scopeOf(input.args);

  if (scope === undefined) {
    input.writeError(
      unknownArgumentsMessage({
        args: input.args.join(' '),
        everythingArgument: EVERYTHING_ARGUMENT,
      }),
    );

    return ExitCode.Stopped;
  }

  const outcome = await input.checkMutations(scope);

  switch (outcome.status) {
    case CheckStatus.NothingChanged:
      input.writeOutput(nothingChangedMessage);

      return ExitCode.Success;
    case CheckStatus.Ran:
      return outcome.exitCode;
    // Stryker disable next-line ConditionalExpression: no member reaches the default, which only the compiler reads
    default:
      return outcome satisfies never;
  }
};

export { runCheckMutations };
