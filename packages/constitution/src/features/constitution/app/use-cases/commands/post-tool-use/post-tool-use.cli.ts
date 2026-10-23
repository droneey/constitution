import type { Command } from '@bunli/core';
import { defineCommand } from '@bunli/core';

import type { Reminder } from '../../../../domain/entities';
import { HOOK_PREFIX } from '../../../constants';
import type { CommandRun } from '../../../types';
import { contextOutputOf, hookEventOf } from '../../../utils';

const EVENT = 'PostToolUse';

interface PostToolUseContext extends CommandRun {
  readonly addReminded: (input: { agent: string; ids: readonly string[]; session: string }) => void;
  readonly remindFile: (input: {
    agent: string;
    path: string;
    session: string;
  }) => Reminder | undefined;
}

// PostToolUse of a tool that reads or edits a file: the blocks that govern it, once per session.
const createPostToolUseCommand = (context: PostToolUseContext): Command =>
  defineCommand({
    // Stryker disable next-line StringLiteral: help text bunli prints; no caller relies on it
    description: 'Name the blocks that govern a file the agent reads or edits, once a session',
    handler: async (): Promise<void> => {
      await context.run({
        prefix: HOOK_PREFIX,
        work: async (): Promise<void> => {
          const event = hookEventOf(await context.io.readInput());
          const filePath = event.field('file_path');
          const asked = {
            agent: event.field('agent_id'),
            path: filePath === '' ? event.field('notebook_path') : filePath,
            session: event.field('session_id'),
          };
          const reminder = context.remindFile(asked);

          if (reminder === undefined || reminder.notes.length === 0) {
            return;
          }

          context.addReminded({
            agent: asked.agent,
            ids: reminder.ids,
            session: asked.session,
          });
          context.io.write(
            contextOutputOf({
              event: EVENT,
              text: reminder.notes.join('\n'),
            }),
          );
        },
      });
    },
    name: 'post-tool-use',
  });

export { createPostToolUseCommand };
