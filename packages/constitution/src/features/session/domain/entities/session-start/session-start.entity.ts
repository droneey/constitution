import type { AbsolutePath } from '#/kernel/value-objects';

import { HookEventName } from '../hook-event-name';

enum SessionOrigin {
  Startup = 'startup',
  Resume = 'resume',
  Clear = 'clear',
  Compact = 'compact',
  Unknown = 'unknown',
}

interface SessionStart {
  readonly event: HookEventName;
  readonly origin: SessionOrigin;
  readonly searchFrom: AbsolutePath;
}

const keepsState = (event: HookEventName): boolean => event === HookEventName.SessionStart;

/** A resumed session keeps the reminders it was given. */
const keepsReminders = (origin: SessionOrigin): boolean => origin === SessionOrigin.Resume;

const isStartup = (start: Pick<SessionStart, 'event' | 'origin'>): boolean =>
  start.event === HookEventName.SessionStart && start.origin === SessionOrigin.Startup;

const SessionStart = {
  isStartup,
  keepsReminders,
  keepsState,
} as const;

export { SessionOrigin, SessionStart };
