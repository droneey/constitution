import type { Command } from '@bunli/core';
import { defineCommand } from '@bunli/core';

import type { StopEvent, StopJudgement } from '../../../../domain/entities';
import { SessionMark, StopVerdict } from '../../../../domain/entities';
import { HOOK_PREFIX } from '../../../constants';
import type { CommandRun } from '../../../types';
import { hookEventOf, jsonTextOf } from '../../../utils';

interface StopContext extends CommandRun {
  readonly judgeStop: (event: StopEvent) => StopJudgement | undefined;
  readonly recordMark: (input: { mark: SessionMark; session: string; value: string }) => void;
}

// Stop and SubagentStop: the hand-back gate.
const createStopCommand = (context: StopContext): Command =>
  defineCommand({
    // Stryker disable next-line StringLiteral: help text bunli prints; no caller relies on it
    description: 'Hold the hand-back until the check passed on the tree, and ask for a review',
    handler: async (): Promise<void> => {
      await context.run({
        prefix: HOOK_PREFIX,
        work: async (): Promise<void> => {
          const event = hookEventOf(await context.io.readInput());
          const session = event.field('session_id');
          const judgement = context.judgeStop({
            agentName: event.field('agent_name'),
            agentType: event.field('agent_type'),
            event: event.field('hook_event_name'),
            isHookActive: event.field('stop_hook_active'),
            session,
          });

          if (judgement === undefined) {
            return;
          }

          switch (judgement.verdict) {
            case StopVerdict.Reviewed:
              context.recordMark({
                mark: SessionMark.Reviewed,
                session,
                value: judgement.fingerprint,
              });
              break;
            case StopVerdict.Blocked:
              context.recordMark({
                mark: SessionMark.Blocked,
                session,
                value: judgement.fingerprint,
              });
              context.io.write(
                `{"decision":"block","reason":"The tree changed since the check last passed. Run the project's check, \`${jsonTextOf(judgement.check)}\`, and hand back only when it passes."}\n`,
              );
              break;
            default: {
              // Review, the one verdict left: a verdict added to the union fails to compile here
              const review: Extract<
                StopJudgement,
                {
                  verdict: StopVerdict.Review;
                }
              > = judgement;

              context.io.write(
                `{"systemMessage":"Changed files fall under ${jsonTextOf(review.blocks.join(', '))}; /check edits reviews them against the rules."}\n`,
              );
            }
          }
        },
      });
    },
    name: 'stop',
  });

export { createStopCommand };
