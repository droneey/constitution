import { Command } from 'commander';

import type { CommandContext } from '#/shared/cli';

import type { StopEvent, StopJudgement } from '../../../../domain/entities';
import { StopVerdict } from '../../../../domain/entities';
import type { SessionId } from '../../../../domain/value-objects';
import { hookEventNameOf, hookEventOf, jsonTextOf, sessionIdOf } from '../../../utils';

interface StopContext extends CommandContext {
  readonly judgeStop: (event: StopEvent) => StopJudgement | undefined;
  readonly recordJudgement: (input: { judgement: StopJudgement; session: SessionId }) => void;
}

const answerOf = (judgement: StopJudgement): string | undefined => {
  switch (judgement.verdict) {
    case StopVerdict.Reviewed:
      return undefined;
    case StopVerdict.Blocked:
      return `{"decision":"block","reason":"The tree changed since the check last passed. Run the project's check, \`${jsonTextOf(judgement.check)}\`, and hand back only when it passes."}\n`;
    case StopVerdict.Review:
      return `{"systemMessage":"Changed files fall under ${jsonTextOf(judgement.blocks.join(', '))}; /check edits reviews them against the rules."}\n`;
    // Stryker disable next-line ConditionalExpression: no verdict reaches the default, which only the compiler reads
    default:
      return judgement satisfies never;
  }
};

/** Stop and SubagentStop: the hand-back gate, the tree it judged recorded. */
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
      const event = hookEventOf(await context.io.readInput());
      const session = sessionIdOf(event);
      const agentName = event.field('agent_name');
      const agentType = event.field('agent_type');

      if (session === undefined) {
        return;
      }

      const judgement = context.judgeStop({
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
        event: hookEventNameOf(event.field('hook_event_name')),
        isHookActive: event.isTrue('stop_hook_active'),
        session,
      });

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
