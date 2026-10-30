import { Command } from 'commander';

import { AbsolutePath } from '#/kernel/value-objects';
import type { CommandContext } from '#/shared/cli';
import { folderPathOf } from '#/shared/cli';

import type { SessionState } from '../../../../domain/session/entities';
import type { SessionId } from '../../../../domain/session/value-objects';
import type { SessionDigest } from '../../../../domain/session-digest/entities';
import type { SessionOrigin, SessionStart } from '../../../../domain/session-start/entities';
import type { HookEventName } from '../../../../domain/shared/entities';
import { HookField, hookEventTexts, sessionStartEventSchema } from '../../../constants';
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
      const answered = hookEventTexts.get(name);

      // Why: Claude Code takes an answer only for an event it names.
      if (answered === undefined) {
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
      const started = context.digestSession(start);
      const session = event[HookField.SessionId];

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
          event: answered,
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
