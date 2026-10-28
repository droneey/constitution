import type { FailureContent, Theme } from '@droneey/design-cli';
import { formatFailure } from '@droneey/design-cli';
import { CommanderError } from 'commander';

import { isTreeError } from '#/features/blocks';
import { isApplyError } from '#/features/presets';
import { isProjectError } from '#/features/project';
import { ExitCode, isUsageError } from '#/shared/cli';

import { isConfigurationError } from './configuration.error';
import {
  APPLY_FAILURE_HINT,
  applyFailureMessages,
  configurationFailureMessages,
  configurationHintMessage,
  DEFECT,
  defectHint,
  defectLine,
  OPTIONS_UNPARSED,
  PROJECT_FAILURE_HINTS,
  projectFailureMessages,
  TREE_FAILURE_HINTS,
  treeFailureMessages,
} from './error-handler.messages';
import { hookPrefix } from './hook.constants';

const COMMANDER_PREFIX = /^error: /;

const commanderFailureOf = (message: string): FailureContent => {
  // Stryker disable next-line StringLiteral: split always yields a first part
  const [first = '', ...rest] = message.trimEnd().split('\n');

  return {
    details: rest,
    title: first.replace(COMMANDER_PREFIX, ''),
  };
};

interface ErrorHandler {
  readonly codeOf: (error: unknown) => ExitCode;
  readonly writeUsage: (message: string) => void;
}

interface ErrorHandlerInput {
  readonly isHook: () => boolean;
  readonly theme: () => Theme;
  readonly writeError: (text: string) => void;
}

/**
 * The handler of last resort: a failure the program foresees ends the run with the code the user
 * can act on, a usage error with the usage code, any other with the code of a defect. A hook
 * writes one line, as its callers read it; a person gets the failure block.
 */
const createErrorHandler = (input: ErrorHandlerInput): ErrorHandler => {
  const write = (
    failure: FailureContent & {
      line?: string;
    },
  ): void => {
    input.writeError(
      input.isHook()
        ? `${hookPrefix}: ${failure.line ?? failure.title}\n`
        : `${formatFailure(input.theme(), failure)}\n`,
    );
  };

  return {
    codeOf: (error: unknown): ExitCode => {
      if (error instanceof CommanderError) {
        return error.exitCode === 0 ? ExitCode.Success : ExitCode.Usage;
      }

      if (isProjectError(error)) {
        write({
          details: [],
          hint: PROJECT_FAILURE_HINTS[error.code],
          title: projectFailureMessages[error.code](error.details.path),
        });

        return ExitCode.Failure;
      }

      if (isTreeError(error)) {
        write({
          details: [],
          hint: TREE_FAILURE_HINTS[error.code],
          title: treeFailureMessages[error.code](error.details.path),
        });

        return ExitCode.Failure;
      }

      if (isApplyError(error)) {
        write({
          details: [],
          hint: APPLY_FAILURE_HINT,
          title: applyFailureMessages[error.code](error.details.filePath),
        });

        return ExitCode.Failure;
      }

      if (isConfigurationError(error)) {
        write({
          details: [],
          hint: configurationHintMessage(error.details.variable),
          title: configurationFailureMessages[error.code](error.details),
        });

        return ExitCode.Usage;
      }

      if (isUsageError(error)) {
        write({
          details: error.details.problems,
          title: OPTIONS_UNPARSED,
        });

        return ExitCode.Usage;
      }

      write({
        details: [],
        hint: defectHint,
        line: defectLine,
        title: DEFECT,
      });

      return ExitCode.Defect;
    },
    writeUsage: (message: string): void => {
      input.writeError(`${formatFailure(input.theme(), commanderFailureOf(message))}\n`);
    },
  };
};

export type { ErrorHandler };
export { createErrorHandler };
