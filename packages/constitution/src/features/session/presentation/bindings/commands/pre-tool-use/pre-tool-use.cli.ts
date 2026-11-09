import { Command } from 'commander';

import type { AbsolutePath } from '#/kernel/value-objects';
import type { CommandContext } from '#/shared/cli';
import { folderPathOf } from '#/shared/cli';

import type { GateTarget, GateVerdict } from '../../../../domain/gate/entities';
import { GateVerdictKind, TargetKind } from '../../../../domain/gate/entities';
import type { AgentInSession } from '../../../../domain/session/entities';
import type { SessionId, ToolUseId } from '../../../../domain/session/value-objects';
import { HookEventName } from '../../../../domain/shared/entities';
import { actionAnswerOf, hookOutputOf, ToolKind } from '../../../utils';
import type { ToolCall } from '../shared/tool-call';
import { toolCallOf } from '../shared/tool-call';

interface PreToolUseContext extends CommandContext {
  readonly gateAction: (
    input: AgentInSession & {
      targets: readonly GateTarget[];
    },
  ) => GateVerdict;
  readonly markShell: (input: {
    call: ToolUseId;
    folderRunIn: AbsolutePath;
    session: SessionId;
  }) => void;
}

const targetOf = (call: ToolCall): GateTarget =>
  call.kind === ToolKind.Editing && call.namedFile !== undefined
    ? {
        kind: TargetKind.File,
        path: folderPathOf({
          from: call.folderRunIn,
          given: call.namedFile,
        }),
      }
    : {
        kind: TargetKind.Folder,
        path: call.folderRunIn,
      };

// Why: an MCP call touches no file it names, so it is not gated beforehand; its tree is kept to find
// after it what it changed.
const gatedKinds: ReadonlySet<ToolKind> = new Set([
  ToolKind.Editing,
  ToolKind.Shell,
]);

const treeBracketedKinds: ReadonlySet<ToolKind> = new Set([
  ToolKind.Mcp,
  ToolKind.Shell,
]);

const passingKinds: ReadonlySet<GateVerdictKind> = new Set([
  GateVerdictKind.Allowed,
  GateVerdictKind.PassedClosed,
  GateVerdictKind.PassedUnread,
]);

const goesThrough = (verdict: GateVerdict): boolean => passingKinds.has(verdict.kind);

const keepTree = (input: { call: ToolCall; context: PreToolUseContext }): void => {
  const { call } = input;

  if (treeBracketedKinds.has(call.kind) && call.call !== undefined) {
    input.context.markShell({
      call: call.call,
      folderRunIn: call.folderRunIn,
      session: call.agent.session,
    });
  }
};

const createPreToolUseCommand = (context: PreToolUseContext): Command =>
  new Command('pre-tool-use')
    .description(
      'Refuse an action until the agent has read, whole, the rules that govern it and the files it read.',
    )
    .addHelpText(
      'before',
      context.helpExamples([
        `printf '{"session_id":"s1","hook_event_name":"PreToolUse","tool_name":"Edit","tool_input":{"file_path":"%s/src/main.ts"}}' "$PWD" | constitution hook pre-tool-use`,
      ]),
    )
    .action(async (): Promise<void> => {
      const call = toolCallOf({
        places: context.places,
        text: await context.io.readInput(),
      });

      if (call === undefined || call.eventName !== HookEventName.PreToolUse) {
        return;
      }

      if (!gatedKinds.has(call.kind)) {
        keepTree({
          call,
          context,
        });

        return;
      }

      const verdict = context.gateAction({
        ...call.agent,
        targets: [
          targetOf(call),
        ],
      });
      const answer = actionAnswerOf(verdict);

      if (answer !== undefined) {
        context.io.write(hookOutputOf(answer));
      }

      if (goesThrough(verdict)) {
        keepTree({
          call,
          context,
        });
      }
    });

export { createPreToolUseCommand };
