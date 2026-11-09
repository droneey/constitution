import { AbsolutePath } from '#/kernel/value-objects';
import type { CommandContext, CommandPlaces } from '#/shared/cli';
import { folderPathOf } from '#/shared/cli';

import type { SessionState } from '../../../../../domain/session/entities';
import type { SessionId } from '../../../../../domain/session/value-objects';
import type { SessionDigest } from '../../../../../domain/session-digest/entities';
import type { SessionOrigin, SessionStart } from '../../../../../domain/session-start/entities';
import type { HookEventName } from '../../../../../domain/shared/entities';
import type { NamedHookEvent } from '../../../../constants';
import { contextOutputOf, digestTextOf } from '../../../../utils';

interface SessionKept {
  readonly event: HookEventName;
  readonly origin: SessionOrigin;
  readonly session: SessionId;
  readonly state: SessionState | undefined;
}

interface StartSessionContext extends CommandContext {
  /**
   * @throws {UnreadableFileError} when the project's constitution.yaml cannot be read
   * @throws {ReleaseError} when the release's blocks cannot be listed
   */
  readonly digestSession: (start: SessionStart) => SessionDigest | undefined;
  readonly keepSession: (kept: SessionKept) => void;
}

interface SessionStartAsked {
  readonly cwd: string | undefined;
  readonly event: NamedHookEvent;
  readonly origin: SessionOrigin;
  readonly places: CommandPlaces;
}

const sessionStartOf = ({ cwd, event, origin, places }: SessionStartAsked): SessionStart => ({
  event,
  origin,
  searchFrom: folderPathOf({
    from: AbsolutePath.create(places.cwd),
    given: places.projectDir ?? cwd ?? places.cwd,
  }),
});

interface StartSessionInput {
  readonly context: StartSessionContext;
  readonly event: NamedHookEvent;
  readonly session: SessionId | undefined;
  readonly start: SessionStart;
}

/**
 * @throws {UnreadableFileError} when the project's constitution.yaml cannot be read
 * @throws {ReleaseError} when the release's blocks cannot be listed
 */
const startSession = ({ context, event, session, start }: StartSessionInput): void => {
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

  context.io.write(
    contextOutputOf({
      event,
      text: digestTextOf(started.contents),
    }),
  );
};

export type { StartSessionContext };
export { sessionStartOf, startSession };
