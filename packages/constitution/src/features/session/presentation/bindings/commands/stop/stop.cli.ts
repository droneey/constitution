import { Command } from 'commander';
import type { z } from 'zod';

import { projectCheck } from '#/kernel/constants';
import type { CommandContext } from '#/shared/cli';
import { LIST_SEPARATOR } from '#/shared/cli';

import type { AgentInSession } from '../../../../domain/session/entities';
import { SessionAgent } from '../../../../domain/session/entities';
import { HookEventName } from '../../../../domain/shared/entities';
import type { StopEvent, StopJudgement } from '../../../../domain/stop-judgement/entities';
import { HandBackStep, StopVerdict } from '../../../../domain/stop-judgement/entities';
import type { TreeFingerprint } from '../../../../domain/tree-state/value-objects';
import { HookField, stopEventSchema } from '../../../constants';
import type { HookOutput } from '../../../utils';
import {
  actionsText,
  agentInSessionOf,
  countedTextOf,
  hookEventOf,
  hookOutputOf,
  listFirst,
  moreFilesText,
  passesToldMessage,
} from '../../../utils';
import {
  checkAndReviewMessage,
  checkMessage,
  filesText,
  moreBlocksText,
  reviewMessage,
  subagentChangesMessage,
  unjudgedMessage,
} from './stop.messages';

// Why: the agent may stop again and again while it waits, and a refusal that named every file and
// every block each time would flood its transcript; a few of each say where to look.
const SHOWN = {
  blocks: 5,
  subagentPaths: 3,
} as const;

interface StopContext extends CommandContext {
  readonly handOverChanges: (input: AgentInSession) => void;
  readonly holdHandBack: (
    input: AgentInSession & {
      fingerprint: TreeFingerprint;
      missing: readonly HandBackStep[];
    },
  ) => boolean;
  readonly judgeStop: (event: StopEvent) => StopJudgement | undefined;
  readonly recordJudgement: (
    input: AgentInSession & {
      judgement: StopJudgement;
    },
  ) => void;
  readonly tellPasses: (input: AgentInSession) => number;
}

type HeldJudgement = Extract<
  StopJudgement,
  {
    readonly verdict: StopVerdict.Blocked;
  }
>;

type JudgedAnswer = Extract<
  HookOutput,
  | {
      decision: 'block';
    }
  | {
      systemMessage: string;
    }
>;

const missingStepsReasonOf = (judgement: HeldJudgement): string => {
  const blocks = listFirst({
    lines: judgement.blocks,
    note: moreBlocksText,
    shown: SHOWN.blocks,
  }).join(LIST_SEPARATOR);

  if (!judgement.missing.includes(HandBackStep.Review)) {
    return checkMessage(projectCheck);
  }

  return judgement.missing.includes(HandBackStep.Check)
    ? checkAndReviewMessage({
        blocks,
        check: projectCheck,
      })
    : reviewMessage(blocks);
};

const subagentChangesReasonOf = (judgement: HeldJudgement): readonly string[] => {
  // Why: two subagents that changed one file owe one review of it.
  const paths = [
    ...new Set(judgement.subagentChanges.map((debt) => debt.path)),
  ];

  return paths.length === 0
    ? []
    : [
        subagentChangesMessage({
          files: countedTextOf({
            count: paths.length,
            text: filesText,
          }),
          paths: listFirst({
            lines: paths,
            note: moreFilesText,
            shown: SHOWN.subagentPaths,
          }).join(LIST_SEPARATOR),
        }),
      ];
};

const heldReasonOf = (judgement: HeldJudgement): string =>
  [
    ...subagentChangesReasonOf(judgement),
    missingStepsReasonOf(judgement),
  ].join('\n');

const answerOf = (input: {
  isHeld: (judgement: HeldJudgement) => boolean;
  judgement: StopJudgement;
}): JudgedAnswer | undefined => {
  const { judgement } = input;

  switch (judgement.verdict) {
    case StopVerdict.Reviewed:
    case StopVerdict.Covered:
      return undefined;
    case StopVerdict.Blocked:
      return input.isHeld(judgement)
        ? {
            decision: 'block',
            reason: heldReasonOf(judgement),
          }
        : undefined;
    case StopVerdict.Unjudged:
      return {
        systemMessage: unjudgedMessage(judgement.reason),
      };
  }
};

const toldOf = (answer: JudgedAnswer | undefined): readonly string[] =>
  answer !== undefined && 'systemMessage' in answer
    ? [
        answer.systemMessage,
      ]
    : [];

const withNotes = (
  answer: JudgedAnswer | undefined,
  notes: readonly string[],
): HookOutput | undefined =>
  notes.length === 0
    ? answer
    : {
        ...answer,
        systemMessage: [
          ...toldOf(answer),
          ...notes,
        ].join('\n'),
      };

const judgedOf = (input: {
  agent: AgentInSession;
  context: StopContext;
  event: StopEvent;
}): JudgedAnswer | undefined => {
  const judgement = input.context.judgeStop(input.event);

  if (judgement === undefined) {
    return undefined;
  }

  input.context.recordJudgement({
    ...input.agent,
    judgement,
  });

  return answerOf({
    isHeld: (held): boolean =>
      input.context.holdHandBack({
        ...input.agent,
        fingerprint: held.fingerprint,
        missing: held.missing,
      }),
    judgement,
  });
};

const stopEventOf = (input: {
  agent: AgentInSession;
  event: z.infer<typeof stopEventSchema>;
}): StopEvent | undefined => {
  const { agent, session } = input.agent;
  const { event } = input;
  const isHookActive = event[HookField.StopHookActive];
  const eventName = event[HookField.HookEventName];
  const agentName = event[HookField.AgentName];
  const agentType = event[HookField.AgentType];

  if (agent === SessionAgent.main) {
    return eventName === HookEventName.SubagentStop
      ? undefined
      : {
          agent,
          event: HookEventName.Stop,
          isHookActive,
          session,
        };
  }

  return eventName === HookEventName.SubagentStop
    ? {
        agent,
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
        isHookActive,
        session,
      }
    : undefined;
};

const passesNotesOf = (input: {
  agent: AgentInSession;
  context: StopContext;
}): readonly string[] => {
  const passes = input.context.tellPasses(input.agent);

  return passes > 0
    ? [
        passesToldMessage(
          countedTextOf({
            count: passes,
            text: actionsText,
          }),
        ),
      ]
    : [];
};

const isHolding = (answer: HookOutput | undefined): boolean =>
  answer !== undefined && 'decision' in answer;

const createStopCommand = (context: StopContext): Command =>
  new Command('stop')
    .description(
      'Hold the hand-back until the check passed on the tree, then until the review covered it.',
    )
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
      const agent = agentInSessionOf({
        agentId: event[HookField.AgentId],
        session: event[HookField.SessionId],
      });

      if (agent === undefined) {
        return;
      }

      const stop = stopEventOf({
        agent,
        event,
      });

      if (stop === undefined) {
        return;
      }

      const answer = withNotes(
        judgedOf({
          agent,
          context,
          event: stop,
        }),
        passesNotesOf({
          agent,
          context,
        }),
      );

      if (agent.agent !== SessionAgent.main && !isHolding(answer)) {
        context.handOverChanges(agent);
      }

      if (answer !== undefined) {
        context.io.write(hookOutputOf(answer));
      }
    });

export { createStopCommand };
