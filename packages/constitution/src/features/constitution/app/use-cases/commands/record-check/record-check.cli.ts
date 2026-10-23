import type { Command } from '@bunli/core';
import { defineCommand } from '@bunli/core';

import { SessionMark } from '../../../../domain/entities';
import { HOOK_PREFIX } from '../../../constants';
import type { CommandRun } from '../../../types';
import { hookEventOf } from '../../../utils';

interface RecordCheckContext extends CommandRun {
  readonly judgeCheckRun: (input: { command: string; session: string }) => string | undefined;
  readonly recordMark: (input: { mark: SessionMark; session: string; value: string }) => void;
}

// PostToolUse of a shell command that passed: notes the tree when the command was the project's
// check. A command that failed fires PostToolUseFailure, never this hook.
const createRecordCheckCommand = (context: RecordCheckContext): Command =>
  defineCommand({
    // Stryker disable next-line StringLiteral: help text bunli prints; no caller relies on it
    description: "Note the tree when a shell command that passed ran the project's check",
    handler: async (): Promise<void> => {
      await context.run({
        prefix: HOOK_PREFIX,
        work: async (): Promise<void> => {
          const event = hookEventOf(await context.io.readInput());
          const session = event.field('session_id');
          const fingerprint = context.judgeCheckRun({
            command: event.field('command'),
            session,
          });

          if (fingerprint !== undefined) {
            context.recordMark({
              mark: SessionMark.Checked,
              session,
              value: fingerprint,
            });
          }
        },
      });
    },
    name: 'record-check',
  });

export { createRecordCheckCommand };
