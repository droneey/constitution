import type { SessionId } from '../../session/value-objects';
import type { HookEventName } from '../../shared/entities';

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
