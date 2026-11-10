import { Command } from 'commander';

import type { AbsolutePath } from '#/kernel/value-objects';

import type { SessionId } from '../../../../domain/session/value-objects';
import type { SessionOrigin } from '../../../../domain/session-start/entities';
import { HookEventName } from '../../../../domain/shared/entities';
import { HookField, sessionStartEventSchema } from '../../../constants';
import { hookEventOf } from '../../../utils';
import type { StartSessionContext } from '../shared/session-start';
import { sessionStartOf, startSession } from '../shared/session-start';

interface SessionStartContext extends StartSessionContext {
  readonly markReviewStart: (started: { agentType?: string; session: SessionId }) => void;
  readonly resetReading: (reset: {
    event: HookEventName;
    origin: SessionOrigin;
    session: SessionId;
  }) => void;
  readonly sweepStaleSessions: (swept: { searchFrom: AbsolutePath; session: SessionId }) => void;
}

const createSessionStartCommand = (context: SessionStartContext): Command =>
  new Command('session-start')
    .description('Give the digest of the active blocks when a session or a subagent starts.')
    .addHelpText(
      'before',
      context.helpExamples([
        `printf '{"cwd":"%s","hook_event_name":"SessionStart","source":"startup"}' "$PWD" | constitution hook session-start`,
      ]),
    )
    .action(async (): Promise<void> => {
      const event = hookEventOf({
        schema: sessionStartEventSchema,
        text: await context.io.readInput(),
      });
      const name = event[HookField.HookEventName];

      // Why: Claude Code takes an answer only for an event it names.
      if (name === HookEventName.Unknown) {
        return;
      }

      const start = sessionStartOf({
        cwd: event[HookField.Cwd],
        event: name,
        origin: event[HookField.Source],
        places: context.places,
      });
      const session = event[HookField.SessionId];

      if (session !== undefined) {
        context.resetReading({
          event: start.event,
          origin: start.origin,
          session,
        });

        if (name === HookEventName.SessionStart) {
          context.sweepStaleSessions({
            searchFrom: start.searchFrom,
            session,
          });
        }
      }

      startSession({
        context,
        event: name,
        session,
        start,
      });

      const agentType = event[HookField.AgentType];

      if (session !== undefined && name === HookEventName.SubagentStart) {
        context.markReviewStart({
          ...(agentType === undefined
            ? {}
            : {
                agentType,
              }),
          session,
        });
      }
    });

export { createSessionStartCommand };
