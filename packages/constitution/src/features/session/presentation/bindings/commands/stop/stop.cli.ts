import { Command } from 'commander';

import { projectCheck } from '#/kernel/constants';
import type { CommandContext } from '#/shared/cli';
import { LIST_SEPARATOR } from '#/shared/cli';

import type { SessionId } from '../../../../domain/session/value-objects';
import { HookEventName } from '../../../../domain/shared/entities';
import type { StopEvent, StopJudgement } from '../../../../domain/stop-judgement/entities';
import { StopVerdict } from '../../../../domain/stop-judgement/entities';
import { HookField, stopEventSchema } from '../../../constants';
import { hookEventOf, hookOutputOf } from '../../../utils';
import { blockedMessage, reviewMessage, unjudgedMessage } from './stop.messages';

interface StopContext extends CommandContext {
  readonly judgeStop: (event: StopEvent) => StopJudgement | undefined;
  readonly recordJudgement: (input: { judgement: StopJudgement; session: SessionId }) => void;
}

const answerOf = (judgement: StopJudgement): string | undefined => {
  switch (judgement.verdict) {
    case StopVerdict.Reviewed:
      return undefined;
    case StopVerdict.Blocked:
      return hookOutputOf({
        decision: 'block',
        reason: blockedMessage(projectCheck),
      });
    case StopVerdict.Review:
      return hookOutputOf({
        systemMessage: reviewMessage(judgement.blocks.join(LIST_SEPARATOR)),
      });
    case StopVerdict.Unjudged:
      return hookOutputOf({
        systemMessage: unjudgedMessage(judgement.reason),
      });
    // Stryker disable next-line ConditionalExpression: no verdict reaches the default, which only the compiler reads
    default:
      return judgement satisfies never;
  }
};

const createStopCommand = (context: StopContext): Command =>
  new Command('stop')
    .description('Hold the hand-back until the check passed on the tree, and ask for a review.')
    .addHelpText(
      'before',
      context.helpExamples([
        `printf '{"session_id":"s1","hook_event_name":"Stop"}' | constitution hook stop`,
      ]),
    )
    .action(async (): Promise<void> => {
      const event = hookEventOf({
        schema: stopEventSchema,
        text: await context.io.readInput(),
      });
      const session = event[HookField.SessionId];
      const agentName = event[HookField.AgentName];
      const agentType = event[HookField.AgentType];

      if (session === undefined) {
        return;
      }

      const stop = {
        isHookActive: event[HookField.StopHookActive],
        session,
      };
      const eventName = event[HookField.HookEventName];
      const judgement = context.judgeStop(
        eventName === HookEventName.SubagentStop
          ? {
              ...stop,
              ...(agentName === undefined
                ? {}
                : {
                    agentName,
                  }),
              ...(agentType === undefined
                ? {}
                : {
                    agentType,
                  }),
              event: eventName,
            }
          : {
              ...stop,
              event: eventName,
            },
      );

      if (judgement === undefined) {
        return;
      }

      context.recordJudgement({
        judgement,
        session,
      });

      const answer = answerOf(judgement);

      if (answer !== undefined) {
        context.io.write(answer);
      }
    });

export { createStopCommand };
