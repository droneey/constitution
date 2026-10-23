import type { WorkingTree } from '../../../contracts';
import type { SessionQueryRepository } from '../../../contracts/repositories/queries';
import type { StopEvent, StopJudgement } from '../../../entities';
import { SessionMark, StopVerdict } from '../../../entities';
import { checksumOf, governingOf, isPlainName } from '../../../utils';

const STOP = 'Stop';
const SUBAGENT_STOP = 'SubagentStop';
const REVIEWER = 'constitution:reviewer';
const ACTIVE = 'true';

/**
 * The hand-back gate: whether the agent, or a subagent, may stop now, and what it is told when it
 * may not; undefined when it may stop, or the session keeps no state.
 */
const judgeStop = (
  input: StopEvent & {
    sessions: SessionQueryRepository;
    workingTree: WorkingTree;
  },
): StopJudgement | undefined => {
  const { sessions, session } = input;
  const state = isPlainName(session) ? sessions.state(session) : undefined;

  if (state === undefined || state.project === '') {
    return undefined;
  }

  const now = checksumOf(input.workingTree.stateOf(state.project));
  const markOf = (mark: SessionMark): string | undefined =>
    sessions.mark({
      mark,
      session,
    });

  if (
    input.event === SUBAGENT_STOP &&
    (input.agentType === REVIEWER || input.agentName === REVIEWER)
  ) {
    return {
      fingerprint: now,
      verdict: StopVerdict.Reviewed,
    };
  }

  const turn = markOf(SessionMark.Turn);
  const check = state.check ?? '';

  if (input.isHookActive === ACTIVE) {
    return undefined;
  }

  if (
    check !== '' &&
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

  if (input.event !== STOP || now === turn || now === markOf(SessionMark.Reviewed)) {
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
