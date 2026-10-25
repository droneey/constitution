import { Command } from 'commander';

import type { CommandContext } from '#/shared/cli';

import type {
  SessionDigest,
  SessionOrigin,
  SessionStart,
  SessionState,
} from '../../../../domain/entities';
import { HookEventName } from '../../../../domain/entities';
import type { SessionId } from '../../../../domain/value-objects';
import {
  contextOutputOf,
  digestOf,
  HOOK_EVENT_TEXT,
  hookEventNameOf,
  hookEventOf,
  sessionIdOf,
  sessionOriginOf,
} from '../../../utils';

interface SessionStartContext extends CommandContext {
  readonly digestSession: (start: SessionStart) => SessionDigest | undefined;
  readonly keepSession: (kept: {
    event: HookEventName;
    origin: SessionOrigin;
    session: SessionId;
    state: SessionState | undefined;
  }) => void;
}

/**
 * SessionStart and SubagentStart: the digest of the rules the session starts with, its state kept
 * for the hooks that follow.
 */
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
      const event = hookEventOf(await context.io.readInput());
      const { places } = context;
      // Claude Code names the event it runs the hook for; one that names none is a session's start.
      const eventText =
        event.field('hook_event_name') ?? HOOK_EVENT_TEXT[HookEventName.SessionStart];
      const start: SessionStart = {
        event: hookEventNameOf(eventText),
        origin: sessionOriginOf(event.field('source')),
        searchFrom: places.projectDir ?? event.field('cwd') ?? places.cwd,
      };
      const started = context.digestSession(start);
      const session = sessionIdOf(event);

      if (started === undefined) {
        return;
      }

      if (session !== undefined) {
        context.keepSession({
          event: start.event,
          origin: start.origin,
          session,
          state: started.state,
        });
      }

      const { body, head } = digestOf(started.contents);

      context.io.write(
        contextOutputOf({
          event: eventText,
          text: [
            ...head,
            ...(body.length === 0
              ? []
              : [
                  '',
                  ...body,
                ]),
          ]
            .map((line) => `${line}\n`)
            .join(''),
        }),
      );
    });

export { createSessionStartCommand };
