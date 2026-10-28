import { Command } from 'commander';

import type { BlockId } from '#/kernel/value-objects';
import type { CommandContext } from '#/shared/cli';

import type { Reminder } from '../../../../domain/entities';
import type { SessionId } from '../../../../domain/value-objects';
import { AgentId } from '../../../../domain/value-objects';
import { HookField, postToolUseEventSchema } from '../../../constants';
import { contextOutputOf, hookEventOf, reminderNotesOf } from '../../../utils';

const EVENT = 'PostToolUse';

interface PostToolUseContext extends CommandContext {
  readonly recordReminders: (input: {
    agent: AgentId | undefined;
    ids: readonly BlockId[];
    session: SessionId;
  }) => void;
  readonly remindOfFile: (input: {
    agent: AgentId | undefined;
    path: string;
    session: SessionId;
  }) => Reminder | undefined;
}

/** PostToolUse of a tool that reads or edits a file. */
const createPostToolUseCommand = (context: PostToolUseContext): Command =>
  new Command('post-tool-use')
    .description('Name the blocks that govern a file the agent reads or edits, once a session.')
    .addHelpText(
      'before',
      context.helpExamples([
        `printf '{"session_id":"s1","tool_input":{"file_path":"src/main.ts"}}' | constitution hook post-tool-use`,
      ]),
    )
    .action(async (): Promise<void> => {
      const event = hookEventOf({
        schema: postToolUseEventSchema,
        text: await context.io.readInput(),
      });
      const session = event[HookField.SessionId];
      const agent = event[HookField.AgentId];
      const path =
        event[HookField.ToolInput][HookField.FilePath] ??
        event[HookField.ToolInput][HookField.NotebookPath];

      // A subagent's id that is no plain name is refused like the session's own.
      if (
        session === undefined ||
        path === undefined ||
        !(agent === undefined || AgentId.is(agent))
      ) {
        return;
      }

      const reminder = context.remindOfFile({
        agent,
        path,
        session,
      });

      if (reminder === undefined) {
        return;
      }

      context.recordReminders({
        agent,
        ids: reminder.blocks.map((block) => block.id),
        session,
      });

      const notes = reminderNotesOf(reminder);

      if (notes.length > 0) {
        context.io.write(
          contextOutputOf({
            event: EVENT,
            text: notes.join('\n'),
          }),
        );
      }
    });

export { createPostToolUseCommand };
