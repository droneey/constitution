import type { Command } from '@bunli/core';
import { defineCommand } from '@bunli/core';

import type { SessionDigest, SessionStart } from '../../../../domain/entities';
import { HOOK_PREFIX } from '../../../constants';
import type { CommandRun } from '../../../types';
import { contextOutputOf, hookEventOf } from '../../../utils';

interface SessionStartContext extends CommandRun {
  readonly digestSession: (start: SessionStart) => SessionDigest | undefined;
  readonly saveSession: (save: NonNullable<SessionDigest['save']>) => void;
}

// SessionStart and SubagentStart: the digest of the rules the session starts with.
const createSessionStartCommand = (context: SessionStartContext): Command =>
  defineCommand({
    // Stryker disable next-line StringLiteral: help text bunli prints; no caller relies on it
    description: 'Give the digest of the active blocks when a session or a subagent starts',
    handler: async (): Promise<void> => {
      await context.run({
        prefix: HOOK_PREFIX,
        work: async (): Promise<void> => {
          const event = hookEventOf(await context.io.readInput());
          const { places } = context;
          // Claude Code's project, else the folder the event names, else the one the run starts in
          const start =
            [
              places.projectDir,
              event.field('cwd'),
            ].find((folder) => folder !== '') ?? places.cwd;
          const started = context.digestSession({
            event: event.field('hook_event_name'),
            origin: event.field('source'),
            session: event.field('session_id'),
            start,
          });

          if (started === undefined) {
            return;
          }

          if (started.save !== undefined) {
            context.saveSession(started.save);
          }

          const { body, head } = started.digest;

          context.io.write(
            contextOutputOf({
              event: started.event,
              text: [
                ...head,
                ...(body.length === 0
                  ? []
                  : [
                      '',
                      ...body,
                    ]),
              ]
                .map((line) => `${line}\n`)
                .join(''),
            }),
          );
        },
      });
    },
    name: 'session-start',
  });

export { createSessionStartCommand };
