import { describe, expect, it } from 'bun:test';

import type { CheckOutcome } from '../../../../../domain/check/entities';
import { CheckScope, CheckStatus } from '../../../../../domain/check/entities';
import { ExitCode } from '../../../../constants';
import { nothingChangedMessage, unknownArgumentsMessage } from '../check-mutations.messages.ts';
import { runCheckMutations } from '../check-mutations.ts';

const ranOutcome: CheckOutcome = {
  exitCode: 1,
  status: CheckStatus.Ran,
};

const nothingChanged: CheckOutcome = {
  status: CheckStatus.NothingChanged,
};

const unknownArguments = (args: string) =>
  unknownArgumentsMessage({
    args,
    everythingArgument: 'all',
  });

const commandOf = (input: { args: readonly string[]; outcome: CheckOutcome }) => {
  const checkedScopes: CheckScope[] = [];
  const errorTexts: string[] = [];
  const outputTexts: string[] = [];

  return {
    checkedScopes,
    errorTexts,
    outputTexts,
    run: () =>
      runCheckMutations({
        args: input.args,
        checkMutations: (scope) => {
          checkedScopes.push(scope);

          return Promise.resolve(input.outcome);
        },
        writeError: (text) => {
          errorTexts.push(text);
        },
        writeOutput: (text) => {
          outputTexts.push(text);
        },
      }),
  };
};

describe('runCheckMutations', () => {
  it.each([
    {
      args: [],
      condition: 'it is given no argument',
      scope: CheckScope.Branch,
    },
    {
      args: [
        'all',
      ],
      condition: 'it is given all',
      scope: CheckScope.Everything,
    },
  ])('should check the scope its arguments name when $condition', async ({ args, scope }) => {
    // Arrange
    const command = commandOf({
      args,
      outcome: ranOutcome,
    });

    // Act
    await command.run();

    // Assert
    expect(command.checkedScopes).toStrictEqual([
      scope,
    ]);
  });

  it.each([
    {
      args: [
        'everything',
      ],
      argumentsText: 'everything',
      condition: 'an argument it does not take',
    },
    {
      args: [
        'all',
        'all',
      ],
      argumentsText: 'all all',
      condition: 'all twice',
    },
  ])(
    'should stop without a check, naming the arguments, when it is given $condition',
    async ({ args, argumentsText }) => {
      // Arrange
      const command = commandOf({
        args,
        outcome: ranOutcome,
      });

      // Act
      const exitCode = await command.run();

      // Assert
      expect({
        checkedScopes: command.checkedScopes,
        errorTexts: command.errorTexts,
        exitCode,
      }).toStrictEqual({
        checkedScopes: [],
        errorTexts: [
          unknownArguments(argumentsText),
        ],
        exitCode: ExitCode.Stopped,
      });
    },
  );

  it('should end with the exit code of the run when the check ran', async () => {
    // Arrange
    const command = commandOf({
      args: [],
      outcome: ranOutcome,
    });

    // Act
    const exitCode = await command.run();

    // Assert
    expect(exitCode).toBe(1);
  });

  it('should say so and succeed when the branch changed no line to mutate', async () => {
    // Arrange
    const command = commandOf({
      args: [],
      outcome: nothingChanged,
    });

    // Act
    const exitCode = await command.run();

    // Assert
    expect({
      exitCode,
      outputTexts: command.outputTexts,
    }).toStrictEqual({
      exitCode: ExitCode.Success,
      outputTexts: [
        nothingChangedMessage,
      ],
    });
  });
});
