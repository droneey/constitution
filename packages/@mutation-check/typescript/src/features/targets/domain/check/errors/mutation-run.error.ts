import { ProgramError } from '#/kernel/errors';

import {
  toolNotRunMessage,
  toolStoppedMessage,
  toolTimedOutMessage,
} from './mutation-run.messages.ts';

enum MutationRunFailure {
  ToolNotRun = 'mutation-tool-not-run',
  ToolTimedOut = 'mutation-tool-timed-out',
  ToolStopped = 'mutation-tool-stopped',
}

interface MutationRunFailureDetails {
  readonly code: MutationRunFailure;
  readonly toolName: string;
}

const messagesByCode: Readonly<Record<MutationRunFailure, (toolName: string) => string>> = {
  [MutationRunFailure.ToolNotRun]: toolNotRunMessage,
  [MutationRunFailure.ToolTimedOut]: toolTimedOutMessage,
  [MutationRunFailure.ToolStopped]: toolStoppedMessage,
};

class MutationRunError extends ProgramError<MutationRunFailureDetails> {
  public constructor(details: MutationRunFailureDetails, options?: ErrorOptions) {
    super(messagesByCode[details.code](details.toolName), details, options);
  }
}

export { MutationRunError, MutationRunFailure };
