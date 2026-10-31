import { z } from 'zod';

import { HookEventName, SessionOrigin } from '../../domain/entities';
import { SessionId, ToolUseId } from '../../domain/value-objects';

enum HookField {
  AgentId = 'agent_id',
  AgentName = 'agent_name',
  AgentType = 'agent_type',
  Command = 'command',
  Cwd = 'cwd',
  FilePath = 'file_path',
  HookEventName = 'hook_event_name',
  Limit = 'limit',
  NotebookPath = 'notebook_path',
  Offset = 'offset',
  SessionId = 'session_id',
  Source = 'source',
  StopHookActive = 'stop_hook_active',
  ToolInput = 'tool_input',
  ToolName = 'tool_name',
  ToolUseId = 'tool_use_id',
}

// Why: Claude Code owns the shapes of its events, so a field a hook does not read is dropped, and
// one that is absent, empty or of another kind reads as absent, a flag as false.
const textField = z.string().min(1).optional().catch(undefined);
const flagField = z.boolean().catch(false);
const countField = z.number().int().optional().catch(undefined);
const toolUseIdField = z
  .string()
  .refine(ToolUseId.is)
  .transform(ToolUseId.create)
  .optional()
  .catch(undefined);
const sessionIdField = z
  .string()
  .refine(SessionId.is)
  .transform(SessionId.create)
  .optional()
  .catch(undefined);

type NamedHookEvent = Exclude<HookEventName, HookEventName.Unknown>;

const HOOK_EVENT_TEXTS = {
  [HookEventName.SessionStart]: 'SessionStart',
  [HookEventName.SubagentStart]: 'SubagentStart',
  [HookEventName.PreToolUse]: 'PreToolUse',
  [HookEventName.PostToolUse]: 'PostToolUse',
  [HookEventName.PostToolUseFailure]: 'PostToolUseFailure',
  [HookEventName.Stop]: 'Stop',
  [HookEventName.SubagentStop]: 'SubagentStop',
  [HookEventName.Unknown]: undefined,
} as const satisfies Readonly<Record<HookEventName, string | undefined>>;

type HookEventText = (typeof HOOK_EVENT_TEXTS)[NamedHookEvent];

const hookEventNames: ReadonlyMap<string | undefined, HookEventName> = new Map(
  Object.values(HookEventName).map(
    (
      name,
    ): [
      HookEventText | undefined,
      HookEventName,
    ] => [
      HOOK_EVENT_TEXTS[name],
      name,
    ],
  ),
);
const SESSION_ORIGIN_TEXTS = {
  [SessionOrigin.Startup]: 'startup',
  [SessionOrigin.Resume]: 'resume',
  [SessionOrigin.Clear]: 'clear',
  [SessionOrigin.Compact]: 'compact',
  [SessionOrigin.Unknown]: undefined,
} as const satisfies Readonly<Record<SessionOrigin, string | undefined>>;

const sessionOrigins: ReadonlyMap<string | undefined, SessionOrigin> = new Map(
  Object.values(SessionOrigin).map(
    (
      origin,
    ): [
      string | undefined,
      SessionOrigin,
    ] => [
      SESSION_ORIGIN_TEXTS[origin],
      origin,
    ],
  ),
);

const eventNameOf = (text: string): HookEventName =>
  hookEventNames.get(text) ?? HookEventName.Unknown;

const eventNameField = z.string().transform(eventNameOf).catch(HookEventName.Unknown);

interface HookEvent {
  readonly [HookField.SessionId]?: SessionId | undefined;
}

interface SessionStartHookEvent extends HookEvent {
  readonly [HookField.Cwd]?: string | undefined;
  readonly [HookField.HookEventName]: HookEventName;
  readonly [HookField.Source]: SessionOrigin;
}

interface StopHookEvent extends HookEvent {
  readonly [HookField.AgentId]?: string | undefined;
  readonly [HookField.AgentName]?: string | undefined;
  readonly [HookField.AgentType]?: string | undefined;
  readonly [HookField.HookEventName]: HookEventName;
  readonly [HookField.StopHookActive]: boolean;
}

interface RecordCheckHookEvent extends HookEvent {
  readonly [HookField.ToolInput]: {
    readonly [HookField.Command]?: string | undefined;
  };
}

interface ToolHookEvent extends HookEvent {
  readonly [HookField.AgentId]?: string | undefined;
  readonly [HookField.Cwd]?: string | undefined;
  readonly [HookField.HookEventName]: HookEventName;
  readonly [HookField.ToolInput]: {
    readonly [HookField.FilePath]?: string | undefined;
    readonly [HookField.Limit]?: number | undefined;
    readonly [HookField.NotebookPath]?: string | undefined;
    readonly [HookField.Offset]?: number | undefined;
  };
  readonly [HookField.ToolName]?: string | undefined;
  readonly [HookField.ToolUseId]?: ToolUseId | undefined;
}

const sessionStartEventSchema: z.ZodType<SessionStartHookEvent> = z.object({
  [HookField.Cwd]: textField,
  [HookField.HookEventName]: z
    .string()
    .min(1)
    .transform(eventNameOf)
    .catch(HookEventName.SessionStart),
  [HookField.SessionId]: sessionIdField,
  [HookField.Source]: z
    .string()
    .transform((text) => sessionOrigins.get(text) ?? SessionOrigin.Unknown)
    .catch(SessionOrigin.Unknown),
});

const sessionEventSchema: z.ZodType<HookEvent> = z.object({
  [HookField.SessionId]: sessionIdField,
});

const stopEventSchema: z.ZodType<StopHookEvent> = z.object({
  [HookField.AgentId]: textField,
  [HookField.AgentName]: textField,
  [HookField.AgentType]: textField,
  [HookField.HookEventName]: eventNameField,
  [HookField.SessionId]: sessionIdField,
  [HookField.StopHookActive]: flagField,
});

const recordCheckEventSchema: z.ZodType<RecordCheckHookEvent> = z.object({
  [HookField.SessionId]: sessionIdField,
  [HookField.ToolInput]: z
    .looseObject({
      [HookField.Command]: textField,
    })
    .catch({}),
});

const toolEventSchema: z.ZodType<ToolHookEvent> = z.object({
  [HookField.AgentId]: textField,
  [HookField.Cwd]: textField,
  [HookField.HookEventName]: eventNameField,
  [HookField.SessionId]: sessionIdField,
  [HookField.ToolInput]: z
    .looseObject({
      [HookField.FilePath]: textField,
      [HookField.Limit]: countField,
      [HookField.NotebookPath]: textField,
      [HookField.Offset]: countField,
    })
    .catch({}),
  [HookField.ToolName]: textField,
  [HookField.ToolUseId]: toolUseIdField,
});

export type { HookEventText, NamedHookEvent };
export {
  HOOK_EVENT_TEXTS,
  HookField,
  recordCheckEventSchema,
  sessionEventSchema,
  sessionStartEventSchema,
  stopEventSchema,
  toolEventSchema,
};
