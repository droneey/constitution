import type { SessionId } from '../value-objects';
import type { HookEventName } from './hook-event.entity';

interface StopEvent {
  readonly agentName?: string;
  readonly agentType?: string;
  readonly event: HookEventName;
  readonly isHookActive: boolean;
  readonly session: SessionId;
}

export type { StopEvent };
