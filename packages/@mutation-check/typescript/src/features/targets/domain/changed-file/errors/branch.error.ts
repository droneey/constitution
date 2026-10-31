import { ProgramError } from '#/kernel/errors';
import type { AbsolutePath } from '#/kernel/value-objects';

import {
  outputPastLimitMessage,
  toolFailedMessage,
  toolNotRunMessage,
  toolTimedOutMessage,
} from './branch.messages.ts';

enum BranchFailure {
  ToolNotRun = 'branch-tool-not-run',
  ToolFailed = 'branch-tool-failed',
  ToolTimedOut = 'branch-tool-timed-out',
  OutputPastLimit = 'branch-output-past-limit',
}

interface BranchCommand {
  readonly args: readonly string[];
  readonly folderPath: AbsolutePath;
  readonly toolName: string;
}

type UnansweredFailure = Exclude<BranchFailure, BranchFailure.ToolFailed>;

type BranchFailureDetails =
  | {
      readonly code: UnansweredFailure;
      readonly command: BranchCommand;
    }
  | {
      readonly code: BranchFailure.ToolFailed;
      readonly command: BranchCommand;
      readonly mainlineName: string;
      readonly stderr: string;
    };

const messageOf = (details: BranchFailureDetails): string => {
  switch (details.code) {
    case BranchFailure.ToolNotRun:
      return toolNotRunMessage(details.command);
    case BranchFailure.ToolFailed:
      return toolFailedMessage({
        ...details.command,
        mainlineName: details.mainlineName,
        stderr: details.stderr,
      });
    case BranchFailure.ToolTimedOut:
      return toolTimedOutMessage(details.command);
    case BranchFailure.OutputPastLimit:
      return outputPastLimitMessage(details.command);
    // Stryker disable next-line ConditionalExpression: no member reaches the default, which only the compiler reads
    default:
      return details satisfies never;
  }
};

class BranchError extends ProgramError<BranchFailureDetails> {
  public constructor(details: BranchFailureDetails, options?: ErrorOptions) {
    super(messageOf(details), details, options);
  }
}

export type { BranchCommand, BranchFailureDetails, UnansweredFailure };
export { BranchError, BranchFailure };
