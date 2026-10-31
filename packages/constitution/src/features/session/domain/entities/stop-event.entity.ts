import type { AgentId, SessionId } from '../value-objects';
import type { HookEventName } from './hook-event-name.entity';
import type { SessionAgent } from './session-agent.entity';

interface StopFields {
  readonly isHookActive: boolean;
  readonly session: SessionId;
}

type StopEvent =
  | (StopFields & {
      readonly agent: typeof SessionAgent.main;
      readonly event: HookEventName.Stop;
    })
  | (StopFields & {
      readonly agent: AgentId;
      readonly agentName?: string;
      readonly agentType?: string;
      readonly event: HookEventName.SubagentStop;
    });

export type { StopEvent };
