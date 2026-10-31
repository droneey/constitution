import { AbsolutePath } from '#/kernel/value-objects';
import type { CommandPlaces } from '#/shared/cli';
import { folderPathOf } from '#/shared/cli';

import type { AgentInSession, HookEventName } from '../../../../../domain/entities';
import type { ToolUseId } from '../../../../../domain/value-objects';
import { HookField, toolEventSchema } from '../../../../constants';
import type { ToolKind } from '../../../../utils';
import { agentInSessionOf, hookEventOf, toolKindOf } from '../../../../utils';

interface ToolCall {
  readonly agent: AgentInSession;
  readonly call: ToolUseId | undefined;
  readonly eventName: HookEventName;
  readonly folderRunIn: AbsolutePath;
  readonly kind: ToolKind;
  readonly limit: number | undefined;
  readonly namedFile: string | undefined;
  readonly offset: number | undefined;
}

interface ToolEventInput {
  readonly places: CommandPlaces;
  readonly text: string;
}

const toolCallOf = (input: ToolEventInput): ToolCall | undefined => {
  const event = hookEventOf({
    schema: toolEventSchema,
    text: input.text,
  });
  const agent = agentInSessionOf({
    agentId: event[HookField.AgentId],
    session: event[HookField.SessionId],
  });
  const tool = event[HookField.ToolName];

  if (agent === undefined || tool === undefined) {
    return undefined;
  }

  const toolInput = event[HookField.ToolInput];
  const { cwd } = input.places;

  return {
    agent,
    call: event[HookField.ToolUseId],
    eventName: event[HookField.HookEventName],
    folderRunIn: folderPathOf({
      from: AbsolutePath.create(cwd),
      given: event[HookField.Cwd] ?? cwd,
    }),
    kind: toolKindOf(tool),
    limit: toolInput[HookField.Limit],
    namedFile: toolInput[HookField.FilePath] ?? toolInput[HookField.NotebookPath],
    offset: toolInput[HookField.Offset],
  };
};

export type { ToolCall };
export { toolCallOf };
