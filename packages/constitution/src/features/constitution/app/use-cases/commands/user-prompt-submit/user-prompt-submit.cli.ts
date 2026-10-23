import type { Command } from '@bunli/core';
import { defineCommand } from '@bunli/core';

import { SessionMark } from '../../../../domain/entities';
import { HOOK_PREFIX } from '../../../constants';
import type { CommandRun } from '../../../types';
import { hookEventOf } from '../../../utils';

interface UserPromptSubmitContext extends CommandRun {
  readonly fingerprintSession: (session: string) => string | undefined;
  readonly recordMark: (input: { mark: SessionMark; session: string; value: string }) => void;
}

// UserPromptSubmit: notes the tree as the turn begins, so the gate knows what the turn changed.
const createUserPromptSubmitCommand = (context: UserPromptSubmitContext): Command =>
  defineCommand({
    // Stryker disable next-line StringLiteral: help text bunli prints; no caller relies on it
    description: 'Note the tree when the user sends a prompt',
    handler: async (): Promise<void> => {
      await context.run({
        prefix: HOOK_PREFIX,
        work: async (): Promise<void> => {
          const session = hookEventOf(await context.io.readInput()).field('session_id');
          const fingerprint = context.fingerprintSession(session);

          if (fingerprint !== undefined) {
            context.recordMark({
              mark: SessionMark.Turn,
              session,
              value: fingerprint,
            });
          }
        },
      });
    },
    name: 'user-prompt-submit',
  });

export { createUserPromptSubmitCommand };
