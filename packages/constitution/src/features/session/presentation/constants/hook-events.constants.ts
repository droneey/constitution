import { z } from 'zod';

import { HookEventName, SessionOrigin } from '../../domain/entities';
import { SessionId } from '../../domain/value-objects';
import { totalTableOf } from '../utils';

enum HookField {
  AgentId = 'agent_id',
  AgentName = 'agent_name',
  AgentType = 'agent_type',
  Command = 'command',
  Cwd = 'cwd',
  FilePath = 'file_path',
  HookEventName = 'hook_event_name',
  NotebookPath = 'notebook_path',
  SessionId = 'session_id',
  Source = 'source',
  StopHookActive = 'stop_hook_active',
  ToolInput = 'tool_input',
}

// Why: Claude Code owns the shapes of its events, so a field a hook does not read is dropped, and
// one that is absent, empty or of another kind reads as absent, a flag as false.
const textField = z.string().min(1).optional().catch(undefined);
const flagField = z.boolean().catch(false);
const sessionIdField = z
  .string()
  .refine(SessionId.is)
  .transform(SessionId.create)
  .optional()
  .catch(undefined);

const hookEventNames = totalTableOf<Exclude<HookEventName, HookEventName.Unknown>>()({
  // biome-ignore lint/style/useNamingConvention: Claude Code names the event SessionStart
  SessionStart: HookEventName.SessionStart,
  // biome-ignore lint/style/useNamingConvention: Claude Code names the event SubagentStart
  SubagentStart: HookEventName.SubagentStart,
  // biome-ignore lint/style/useNamingConvention: Claude Code names the event Stop
  Stop: HookEventName.Stop,
  // biome-ignore lint/style/useNamingConvention: Claude Code names the event SubagentStop
  SubagentStop: HookEventName.SubagentStop,
});
const hookEventTexts: ReadonlyMap<HookEventName, string> = new Map(
  [
    ...hookEventNames,
  ].map(
    ([text, name]): [
      HookEventName,
      string,
    ] => [
      name,
      text,
    ],
  ),
);
const sessionOrigins = totalTableOf<Exclude<SessionOrigin, SessionOrigin.Unknown>>()({
  startup: SessionOrigin.Startup,
  resume: SessionOrigin.Resume,
  clear: SessionOrigin.Clear,
  compact: SessionOrigin.Compact,
});

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

interface PostToolUseHookEvent extends HookEvent {
  readonly [HookField.AgentId]?: string | undefined;
  readonly [HookField.ToolInput]: {
    readonly [HookField.FilePath]?: string | undefined;
    readonly [HookField.NotebookPath]?: string | undefined;
  };
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

const userPromptSubmitEventSchema: z.ZodType<HookEvent> = z.object({
  [HookField.SessionId]: sessionIdField,
});

const stopEventSchema: z.ZodType<StopHookEvent> = z.object({
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

const postToolUseEventSchema: z.ZodType<PostToolUseHookEvent> = z.object({
  [HookField.AgentId]: textField,
  [HookField.SessionId]: sessionIdField,
  [HookField.ToolInput]: z
    .looseObject({
      [HookField.FilePath]: textField,
      [HookField.NotebookPath]: textField,
    })
    .catch({}),
});

export {
  HookField,
  hookEventTexts,
  postToolUseEventSchema,
  recordCheckEventSchema,
  sessionStartEventSchema,
  stopEventSchema,
  userPromptSubmitEventSchema,
};
