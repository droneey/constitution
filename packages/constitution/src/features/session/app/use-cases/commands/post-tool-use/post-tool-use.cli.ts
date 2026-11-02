import { Command } from 'commander';

import type { AbsolutePath, BlockId } from '#/kernel/value-objects';
import type { CommandContext } from '#/shared/cli';
import { folderPathOf } from '#/shared/cli';

import type { AgentInSession, Reminder } from '../../../../domain/entities';
import { HookEventName } from '../../../../domain/entities';
import type { ReadRange } from '../../../../domain/use-cases/commands/record-read';
import type { ToolUseId } from '../../../../domain/value-objects';
import { contextOutputOf, reminderNotesOf, ToolKind } from '../../../utils';
import type { ToolCall } from '../shared/tool-call';
import { toolCallOf } from '../shared/tool-call';

interface PostToolUseContext extends CommandContext {
  readonly recordOwnChanges: (
    input: AgentInSession & {
      paths: readonly AbsolutePath[];
    },
  ) => void;
  readonly recordRead: (
    input: AgentInSession & {
      path: AbsolutePath;
      range: ReadRange;
    },
  ) => void;
  readonly recordReminders: (
    input: AgentInSession & {
      ids: readonly BlockId[];
    },
  ) => void;
  readonly remindOfFile: (
    input: AgentInSession & {
      path: string;
    },
  ) => Reminder | undefined;
  readonly settleShell: (
    input: AgentInSession & {
      call: ToolUseId;
    },
  ) => readonly AbsolutePath[];
}

interface ToolDone extends ToolCall {
  readonly context: PostToolUseContext;
}

const namedPathOf = (done: ToolDone, namedFile: string): AbsolutePath =>
  folderPathOf({
    from: done.folderRunIn,
    given: namedFile,
  });

const recordFileRead = (done: ToolDone): void => {
  if (done.kind === ToolKind.Reading && done.namedFile !== undefined) {
    done.context.recordRead({
      ...done.agent,
      path: namedPathOf(done, done.namedFile),
      range: {
        ...(done.limit === undefined
          ? {}
          : {
              limit: done.limit,
            }),
        ...(done.offset === undefined
          ? {}
          : {
              offset: done.offset,
            }),
      },
    });
  }
};

const settleChanges = (done: ToolDone): readonly AbsolutePath[] => {
  if ((done.kind === ToolKind.Shell || done.kind === ToolKind.Mcp) && done.call !== undefined) {
    return done.context.settleShell({
      ...done.agent,
      call: done.call,
    });
  }

  return done.kind === ToolKind.Editing && done.namedFile !== undefined
    ? [
        namedPathOf(done, done.namedFile),
      ]
    : [];
};

const remindOfGoverningBlocks = (done: ToolDone): readonly string[] => {
  const { context, namedFile } = done;
  const reminder =
    namedFile === undefined || !(done.kind === ToolKind.Reading || done.kind === ToolKind.Editing)
      ? undefined
      : context.remindOfFile({
          ...done.agent,
          path: namedFile,
        });

  if (reminder === undefined) {
    return [];
  }

  const notes = reminderNotesOf(reminder);

  context.recordReminders({
    ...done.agent,
    ids: notes.shown,
  });

  return notes.lines;
};

const createPostToolUseCommand = (context: PostToolUseContext): Command =>
  new Command('post-tool-use')
    .description(
      'Record what an agent read or changed, and name the blocks that govern a file it reads or edits.',
    )
    .addHelpText(
      'before',
      context.helpExamples([
        `printf '{"session_id":"s1","hook_event_name":"PostToolUse","tool_name":"Read","tool_input":{"file_path":"%s/src/main.ts"}}' "$PWD" | constitution hook post-tool-use`,
      ]),
    )
    .action(async (): Promise<void> => {
      const call = toolCallOf({
        places: context.places,
        text: await context.io.readInput(),
      });

      if (call === undefined) {
        return;
      }

      const done: ToolDone = {
        ...call,
        context,
      };

      recordFileRead(done);

      const changedPaths = settleChanges(done);

      if (changedPaths.length > 0) {
        context.recordOwnChanges({
          ...done.agent,
          paths: changedPaths,
        });
      }

      if (
        call.eventName !== HookEventName.PostToolUse &&
        call.eventName !== HookEventName.PostToolUseFailure
      ) {
        return;
      }

      const lines = remindOfGoverningBlocks(done);

      if (lines.length > 0) {
        context.io.write(
          contextOutputOf({
            event: call.eventName,
            text: lines.join('\n'),
          }),
        );
      }
    });

export { createPostToolUseCommand };
