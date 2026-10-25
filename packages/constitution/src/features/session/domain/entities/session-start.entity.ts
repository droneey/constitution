import type { HookEventName } from './hook-event.entity';

/** How a session started, as Claude Code names it; any other is Unknown. */
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
  /** the folder the project is looked for from */
  readonly searchFrom: string;
}

export type { SessionStart };
export { SessionOrigin };
