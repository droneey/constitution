import { Command } from 'commander';

import type { CommandContext } from '#/shared/cli';

import type { SessionId } from '../../../../domain/value-objects';
import { hookEventOf, sessionIdOf } from '../../../utils';

interface RecordCheckContext extends CommandContext {
  readonly recordCheck: (input: { command: string; session: SessionId }) => void;
}

/**
 * PostToolUse of a shell command that passed. A command that failed fires PostToolUseFailure, never
 * this hook.
 */
const createRecordCheckCommand = (context: RecordCheckContext): Command =>
  new Command('record-check')
    .description("Note the tree when a shell command that passed ran the project's check.")
    .addHelpText(
      'before',
      context.helpExamples([
        `printf '{"session_id":"s1","tool_input":{"command":"bun run check"}}' | constitution hook record-check`,
      ]),
    )
    .action(async (): Promise<void> => {
      const event = hookEventOf(await context.io.readInput());
      const session = sessionIdOf(event);
      const command = event.field('command');

      if (session !== undefined && command !== undefined) {
        context.recordCheck({
          command,
          session,
        });
      }
    });

export { createRecordCheckCommand };
