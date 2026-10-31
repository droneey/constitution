import { Command } from 'commander';

import type { CommandContext } from '#/shared/cli';

import type { SessionId } from '../../../../domain/value-objects';
import { sessionOfEvent } from '../shared/session-event';

interface SessionEndContext extends CommandContext {
  readonly endSession: (session: SessionId) => void;
}

const createSessionEndCommand = (context: SessionEndContext): Command =>
  new Command('session-end')
    .description(
      'Remove the folders a session has in the projects it was given rules to read in, when it ends.',
    )
    .addHelpText(
      'before',
      context.helpExamples([
        `printf '{"session_id":"s1","hook_event_name":"SessionEnd","reason":"other"}' | constitution hook session-end`,
      ]),
    )
    .action(async (): Promise<void> => {
      const session = sessionOfEvent(await context.io.readInput());

      if (session !== undefined) {
        context.endSession(session);
      }
    });

export { createSessionEndCommand };
