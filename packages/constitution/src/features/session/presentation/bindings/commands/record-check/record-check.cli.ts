import { Command } from 'commander';

import { projectCheck } from '#/kernel/constants';
import type { CommandContext } from '#/shared/cli';

import type { SessionId } from '../../../../domain/session/value-objects';
import { HookField, recordCheckEventSchema } from '../../../constants';
import { hookEventOf } from '../../../utils';

interface RecordCheckContext extends CommandContext {
  readonly recordCheck: (input: { command: string; session: SessionId }) => void;
}

// Why: a command that failed fires PostToolUseFailure, never this hook.
const createRecordCheckCommand = (context: RecordCheckContext): Command =>
  new Command('record-check')
    .description("Note the tree when a shell command that passed ran the project's check.")
    .addHelpText(
      'before',
      context.helpExamples([
        `printf '{"session_id":"s1","tool_input":{"command":"${projectCheck}"}}' | constitution hook record-check`,
      ]),
    )
    .action(async (): Promise<void> => {
      const event = hookEventOf({
        schema: recordCheckEventSchema,
        text: await context.io.readInput(),
      });
      const session = event[HookField.SessionId];
      const command = event[HookField.ToolInput][HookField.Command];

      if (session !== undefined && command !== undefined) {
        context.recordCheck({
          command,
          session,
        });
      }
    });

export { createRecordCheckCommand };
