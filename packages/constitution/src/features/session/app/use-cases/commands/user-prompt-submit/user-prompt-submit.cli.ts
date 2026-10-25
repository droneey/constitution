import { Command } from 'commander';

import type { CommandContext } from '#/shared/cli';

import type { SessionId } from '../../../../domain/value-objects';
import { hookEventOf, sessionIdOf } from '../../../utils';

// Stryker disable ArrayDeclaration,StringLiteral: help text commander prints; no caller relies on it
const DESCRIPTION = 'Note the tree when the user sends a prompt.';
const EXAMPLES: readonly string[] = [
  `printf '{"session_id":"s1"}' | constitution hook user-prompt-submit`,
] as const;
// Stryker restore ArrayDeclaration,StringLiteral

interface UserPromptSubmitContext extends CommandContext {
  readonly markTurn: (session: SessionId) => void;
}

/** UserPromptSubmit: notes the tree as the turn begins, so the gate knows what the turn changed. */
const createUserPromptSubmitCommand = (context: UserPromptSubmitContext): Command =>
  context.withExamples(
    new Command('user-prompt-submit').description(DESCRIPTION).action(async (): Promise<void> => {
      const session = sessionIdOf(hookEventOf(await context.io.readInput()));

      if (session !== undefined) {
        context.markTurn(session);
      }
    }),
    EXAMPLES,
  );

export { createUserPromptSubmitCommand };
