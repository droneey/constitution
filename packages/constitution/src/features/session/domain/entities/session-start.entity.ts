import type { AbsolutePath } from '#/kernel/value-objects';

import type { HookEventName } from './hook-event-name.entity';

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

export type { SessionStart };
export { SessionOrigin };
