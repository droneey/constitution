import type { WorkingTree } from '../../../contracts';
import type { SessionQueryRepository } from '../../../contracts/repositories/queries';
import type { SessionState } from '../../../entities';
import { checksumOf, isPlainName } from '../../../utils';

interface Fingerprinted {
  readonly fingerprint: string;
  readonly state: SessionState;
}

/**
 * The session's state and the fingerprint of its project's tree now; undefined when the session
 * keeps no state.
 */
const fingerprintSession = (input: {
  session: string;
  sessions: SessionQueryRepository;
  workingTree: WorkingTree;
}): Fingerprinted | undefined => {
  const state = isPlainName(input.session) ? input.sessions.state(input.session) : undefined;

  if (state === undefined || state.project === '') {
    return undefined;
  }

  return {
    fingerprint: checksumOf(input.workingTree.stateOf(state.project)),
    state,
  };
};

const SEPARATORS: readonly string[] = [
  '&& ',
  '; ',
];

// Whether a shell command runs the check: alone, first, or after && or ;, and ended by the line, a
// blank or a ;.
const runsCheck = (input: { check: string; command: string }): boolean => {
  const { check, command } = input;

  return (
    command === check ||
    command.startsWith(`${check} `) ||
    command.startsWith(`${check};`) ||
    SEPARATORS.some(
      (separator) =>
        command.endsWith(`${separator}${check}`) ||
        command.includes(`${separator}${check} `) ||
        command.includes(`${separator}${check};`),
    )
  );
};

/**
 * The fingerprint of the tree when a command the agent ran is the project's check; undefined when
 * it is not, or the session keeps no state or names no check.
 */
const judgeCheckRun = (input: {
  command: string;
  session: string;
  sessions: SessionQueryRepository;
  workingTree: WorkingTree;
}): string | undefined => {
  const state = isPlainName(input.session) ? input.sessions.state(input.session) : undefined;

  if (state === undefined || state.project === '' || !state.check) {
    return undefined;
  }

  return runsCheck({
    check: state.check,
    command: input.command,
  })
    ? checksumOf(input.workingTree.stateOf(state.project))
    : undefined;
};

export type { Fingerprinted };
export { fingerprintSession, judgeCheckRun };
