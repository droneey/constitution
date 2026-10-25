import type { WorkingTree } from '#/kernel/contracts';

import type { SessionCommandRepository } from '../../../contracts/repositories/commands';
import { CheckState, SessionMark } from '../../../entities';
import type { SessionId } from '../../../value-objects';
import { fingerprintOf } from '../../shared/checksum';

const SEPARATORS: readonly string[] = [
  '&& ',
  '; ',
] as const;

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
 * Records the fingerprint of the tree as checked when a command the agent ran is the project's
 * check; records nothing when it is not, or the session keeps no state or names no check.
 */
const recordCheck = (input: {
  command: string;
  session: SessionId;
  sessions: SessionCommandRepository;
  workingTree: WorkingTree;
}): void => {
  const state = input.sessions.state(input.session);

  if (state === undefined) {
    return;
  }

  const check = CheckState.commandOf(state.check);

  if (
    check === undefined ||
    !runsCheck({
      check,
      command: input.command,
    })
  ) {
    return;
  }

  input.sessions.recordMark({
    mark: SessionMark.Checked,
    session: input.session,
    value: fingerprintOf({
      project: state.project,
      workingTree: input.workingTree,
    }),
  });
};

export { recordCheck };
