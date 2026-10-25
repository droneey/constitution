import { Command } from 'commander';

import type { CommandContext } from '#/shared/cli';

import type { SessionId } from '../../../../domain/value-objects';
import { hookEventOf, sessionIdOf } from '../../../utils';

interface UserPromptSubmitContext extends CommandContext {
  readonly markTurn: (session: SessionId) => void;
}

/** UserPromptSubmit: notes the tree as the turn begins, so the gate knows what the turn changed. */
const createUserPromptSubmitCommand = (context: UserPromptSubmitContext): Command =>
  new Command('user-prompt-submit')
    .description('Note the tree when the user sends a prompt.')
    .addHelpText(
      'before',
      context.helpExamples([
        `printf '{"session_id":"s1"}' | constitution hook user-prompt-submit`,
      ]),
    )
    .action(async (): Promise<void> => {
      const session = sessionIdOf(hookEventOf(await context.io.readInput()));

      if (session !== undefined) {
        context.markTurn(session);
      }
    });

export { createUserPromptSubmitCommand };
