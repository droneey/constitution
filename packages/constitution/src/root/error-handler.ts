import type { FailureContent, Theme } from '@droneey/design-cli';
import { formatFailure } from '@droneey/design-cli';
import { CommanderError } from 'commander';

import type { TreeError } from '#/features/blocks';
import { isTreeError, TreeFailure } from '#/features/blocks';
import type { ProjectError } from '#/kernel/errors';
import { isProjectError, ProjectFailure } from '#/kernel/errors';
import { isUsageError } from '#/shared/cli';

import type { ConfigurationError } from './configuration.error';
import { ConfigurationFailure, isConfigurationError } from './configuration.error';
import { ExitCode } from './exit-codes';

const ISSUES = 'https://github.com/droneey/constitution/issues';
const HOOK = 'constitution hook';
const DOCTOR = 'run constitution doctor, which says what is wrong with the installation';
const COMMANDER_PREFIX = /^error: /;

const messageOf = (error: ProjectError): string => {
  const messages: Readonly<Record<ProjectFailure, string>> = {
    [ProjectFailure.ReleaseMissing]: `${error.details.path} does not exist — run mise install`,
    [ProjectFailure.BlocksUnlisted]: `cannot list the blocks of ${error.details.path}`,
    [ProjectFailure.ConfigUnparsed]: `constitution.yaml does not parse at line ${String(error.details.line ?? 0)}`,
    [ProjectFailure.ConfigUnreadable]: `cannot read ${error.details.path}`,
    [ProjectFailure.CoreUnreadable]: 'cannot build the digest',
    [ProjectFailure.ManifestUnreadable]: `cannot read ${error.details.path}`,
    [ProjectFailure.NoProject]: 'no constitution.yaml in this folder or above it',
    [ProjectFailure.VersionMissing]: `${error.details.path} has no version`,
  };

  return messages[error.code];
};

const hintOf = (failure: ProjectFailure): string => {
  const hints: Readonly<Record<ProjectFailure, string>> = {
    [ProjectFailure.ReleaseMissing]: DOCTOR,
    [ProjectFailure.BlocksUnlisted]: DOCTOR,
    [ProjectFailure.ConfigUnparsed]: 'fix constitution.yaml at that line',
    [ProjectFailure.ConfigUnreadable]: 'make constitution.yaml readable',
    [ProjectFailure.CoreUnreadable]: DOCTOR,
    [ProjectFailure.ManifestUnreadable]: DOCTOR,
    [ProjectFailure.NoProject]: 'run /constitution:ratify in a Claude Code session to write one',
    [ProjectFailure.VersionMissing]: DOCTOR,
  };

  return hints[failure];
};

const treeMessageOf = (error: TreeError): string => {
  const messages: Readonly<Record<TreeFailure, string>> = {
    [TreeFailure.Failed]: `git could not list the files of ${error.details.path}`,
    [TreeFailure.TimedOut]: `git did not list the files of ${error.details.path} in time`,
    [TreeFailure.Unreadable]: `cannot read ${error.details.path}`,
  };

  return messages[error.code];
};

const treeHintOf = (failure: TreeFailure): string => {
  const gitStatus = 'run git status there, which says what git cannot read';
  const hints: Readonly<Record<TreeFailure, string>> = {
    [TreeFailure.Failed]: gitStatus,
    [TreeFailure.TimedOut]: gitStatus,
    [TreeFailure.Unreadable]: 'make the file readable, or remove it from the tree',
  };

  return hints[failure];
};

const configurationMessageOf = (error: ConfigurationError): string => {
  const { variable, written } = error.details;
  const messages: Readonly<Record<ConfigurationFailure, string>> = {
    [ConfigurationFailure.DayMalformed]: `${variable} is "${written}", which is no date written YYYY-MM-DD`,
  };

  return messages[error.code];
};

// What commander writes of a command line typed wrong, as a failure: its first line the title.
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

/**
 * The handler of last resort: a failure the program foresees ends the run with the code the user
 * can act on, a usage error with the usage code, any other with the code of a defect. A hook
 * writes one line, as its callers read it; a person gets the failure block.
 */
const createErrorHandler = (input: {
  isHook: () => boolean;
  theme: () => Theme;
  writeError: (text: string) => void;
}): ErrorHandler => {
  const write = (
    failure: FailureContent & {
      line: string;
    },
  ): void => {
    input.writeError(
      input.isHook() ? `${HOOK}: ${failure.line}\n` : `${formatFailure(input.theme(), failure)}\n`,
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
          hint: hintOf(error.code),
          line: messageOf(error),
          title: messageOf(error),
        });

        return ExitCode.Failure;
      }

      if (isTreeError(error)) {
        write({
          details: [],
          hint: treeHintOf(error.code),
          line: treeMessageOf(error),
          title: treeMessageOf(error),
        });

        return ExitCode.Failure;
      }

      if (isConfigurationError(error)) {
        const line = configurationMessageOf(error);

        write({
          details: [],
          hint: `unset ${error.details.variable}, which only the program's specs set`,
          line,
          title: line,
        });

        return ExitCode.Usage;
      }

      if (isUsageError(error)) {
        write({
          details: error.details.problems,
          line: 'the options do not parse',
          title: 'the options do not parse',
        });

        return ExitCode.Usage;
      }

      write({
        details: [],
        hint: `report it at ${ISSUES}`,
        line: `the run stopped on an error of its own; report it at ${ISSUES}`,
        title: 'the run stopped on an error of its own',
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
