import { Command } from 'commander';

import { AbsolutePath } from '#/kernel/value-objects';
import type { CommandContext } from '#/shared/cli';
import { folderPathOf } from '#/shared/cli';

import type {
  SessionDigest,
  SessionOrigin,
  SessionStart,
  SessionState,
} from '../../../../domain/entities';
import { HookEventName } from '../../../../domain/entities';
import type { SessionId } from '../../../../domain/value-objects';
import { HookField, sessionStartEventSchema } from '../../../constants';
import { contextOutputOf, digestOf, hookEventOf } from '../../../utils';

interface SessionStartContext extends CommandContext {
  /**
   * @throws {UnreadableFileError} when the project's constitution.yaml cannot be read
   * @throws {ReleaseError} when the release's blocks cannot be listed
   */
  readonly digestSession: (start: SessionStart) => SessionDigest | undefined;
  readonly keepSession: (kept: {
    event: HookEventName;
    origin: SessionOrigin;
    session: SessionId;
    state: SessionState | undefined;
  }) => void;
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
      const { places } = context;
      const name = event[HookField.HookEventName];

      // Why: Claude Code takes an answer only for an event it names.
      if (name === HookEventName.Unknown) {
        return;
      }

      const start: SessionStart = {
        event: name,
        origin: event[HookField.Source],
        searchFrom: folderPathOf({
          from: AbsolutePath.create(places.cwd),
          given: places.projectDir ?? event[HookField.Cwd] ?? places.cwd,
        }),
      };
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

      const started = context.digestSession(start);

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
          event: name,
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
