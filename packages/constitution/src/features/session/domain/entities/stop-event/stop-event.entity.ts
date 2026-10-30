import type { SessionId } from '../../value-objects';
import type { HookEventName } from '../hook-event-name';

interface StopFields {
  readonly isHookActive: boolean;
  readonly session: SessionId;
}

type StopEvent =
  | (StopFields & {
      readonly event: Exclude<HookEventName, HookEventName.SubagentStop>;
    })
  | (StopFields & {
      readonly agentName?: string;
      readonly agentType?: string;
      readonly event: HookEventName.SubagentStop;
    });

export type { StopEvent };
