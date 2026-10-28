import { Command } from 'commander';

import type { CommandContext } from '#/shared/cli';

import type { SessionId } from '../../../../domain/value-objects';
import { HookField, userPromptSubmitEventSchema } from '../../../constants';
import { hookEventOf } from '../../../utils';

interface UserPromptSubmitContext extends CommandContext {
  readonly markTurn: (session: SessionId) => void;
}

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
      const session = hookEventOf({
        schema: userPromptSubmitEventSchema,
        text: await context.io.readInput(),
      })[HookField.SessionId];

      if (session !== undefined) {
        context.markTurn(session);
      }
    });

export { createUserPromptSubmitCommand };
