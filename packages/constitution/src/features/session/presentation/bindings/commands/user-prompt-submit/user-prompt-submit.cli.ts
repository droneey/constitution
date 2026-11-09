import { Command } from 'commander';

import type { SessionId } from '../../../../domain/session/value-objects';
import { SessionOrigin } from '../../../../domain/session-start/entities';
import { HookEventName } from '../../../../domain/shared/entities';
import { HookField, promptEventSchema } from '../../../constants';
import { hookEventOf } from '../../../utils';
import type { StartSessionContext } from '../shared/session-start';
import { sessionStartOf, startSession } from '../shared/session-start';

interface UserPromptSubmitContext extends StartSessionContext {
  readonly isSessionStarted: (session: SessionId) => boolean;
  readonly markTurn: (session: SessionId) => void;
}

const createUserPromptSubmitCommand = (context: UserPromptSubmitContext): Command =>
  new Command('user-prompt-submit')
    .description(
      'Note the tree when the user sends a prompt, starting first a session that had no start.',
    )
    .addHelpText(
      'before',
      context.helpExamples([
        `printf '{"session_id":"s1","cwd":"%s"}' "$PWD" | constitution hook user-prompt-submit`,
      ]),
    )
    .action(async (): Promise<void> => {
      const event = hookEventOf({
        schema: promptEventSchema,
        text: await context.io.readInput(),
      });
      const session = event[HookField.SessionId];

      if (session === undefined) {
        return;
      }

      // Why: a session that had no start, as one whose plugin is turned on while it runs, takes the
      // start's step at its first prompt, which keeps its state or records the start.
      if (!context.isSessionStarted(session)) {
        startSession({
          context,
          event: HookEventName.UserPromptSubmit,
          session,
          start: sessionStartOf({
            cwd: event[HookField.Cwd],
            event: HookEventName.UserPromptSubmit,
            origin: SessionOrigin.Unknown,
            places: context.places,
          }),
        });
      }

      context.markTurn(session);
    });

export { createUserPromptSubmitCommand };
