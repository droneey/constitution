import type { WorkingTree } from '#/kernel/contracts';

import type { SessionQueryRepository } from '../../../contracts/repositories/queries';
import type { StopEvent, StopJudgement } from '../../../entities';
import { CheckState, HookEventName, SessionMark, StopVerdict } from '../../../entities';
import { fingerprintOf } from '../../shared/checksum';
import { governingOf } from '../shared/governing';

const REVIEWER = 'constitution:reviewer';

interface JudgeStopInput extends StopEvent {
  readonly sessions: SessionQueryRepository;
  readonly workingTree: WorkingTree;
}

/**
 * The hand-back gate: whether the agent, or a subagent, may stop now, and what it is told when it
 * may not; undefined when it may stop, or the session keeps no state.
 */
const judgeStop = (input: JudgeStopInput): StopJudgement | undefined => {
  const { sessions, session } = input;
  const state = sessions.state(session);

  if (state === undefined) {
    return undefined;
  }

  const now = fingerprintOf({
    project: state.project,
    workingTree: input.workingTree,
  });

  const markOf = (mark: SessionMark): string | undefined =>
    sessions.mark({
      mark,
      session,
    });

  if (
    input.event === HookEventName.SubagentStop &&
    (input.agentType === REVIEWER || input.agentName === REVIEWER)
  ) {
    return {
      fingerprint: now,
      verdict: StopVerdict.Reviewed,
    };
  }

  const turn = markOf(SessionMark.Turn);
  const check = CheckState.commandOf(state.check);

  if (input.isHookActive) {
    return undefined;
  }

  if (
    check !== undefined &&
    now !== turn &&
    now !== markOf(SessionMark.Checked) &&
    now !== markOf(SessionMark.Blocked)
  ) {
    return {
      check,
      fingerprint: now,
      verdict: StopVerdict.Blocked,
    };
  }

  if (input.event !== HookEventName.Stop || now === turn || now === markOf(SessionMark.Reviewed)) {
    return undefined;
  }

  const blocks = [
    ...new Set(
      input.workingTree.changedFiles(state.project).flatMap((path) =>
        governingOf({
          active: state.active,
          path,
        }).map((block) => block.id),
      ),
    ),
  ];

  return blocks.length === 0
    ? undefined
    : {
        blocks,
        verdict: StopVerdict.Review,
      };
};

export { judgeStop };
