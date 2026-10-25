import { Command } from 'commander';

import type { CommandContext } from '#/shared/cli';

import type { SessionId } from '../../../../domain/value-objects';
import { hookEventOf, sessionIdOf } from '../../../utils';

// Stryker disable ArrayDeclaration,StringLiteral: help text commander prints; no caller relies on it
const DESCRIPTION = "Note the tree when a shell command that passed ran the project's check.";
const EXAMPLES: readonly string[] = [
  `printf '{"session_id":"s1","tool_input":{"command":"bun run check"}}' | constitution hook record-check`,
] as const;
// Stryker restore ArrayDeclaration,StringLiteral

interface RecordCheckContext extends CommandContext {
  readonly recordCheck: (input: { command: string; session: SessionId }) => void;
}

/**
 * PostToolUse of a shell command that passed. A command that failed fires PostToolUseFailure, never
 * this hook.
 */
const createRecordCheckCommand = (context: RecordCheckContext): Command =>
  context.withExamples(
    new Command('record-check').description(DESCRIPTION).action(async (): Promise<void> => {
      const event = hookEventOf(await context.io.readInput());
      const session = sessionIdOf(event);
      const command = event.field('command');

      if (session !== undefined && command !== undefined) {
        context.recordCheck({
          command,
          session,
        });
      }
    }),
    EXAMPLES,
  );

export { createRecordCheckCommand };
