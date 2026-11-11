import { checkMarkOf } from '../../../../domain/session/entities';
import type { SessionId } from '../../../../domain/session/value-objects';
import { ShellCommand } from '../../../../domain/shell-command/value-objects';
import type { WorkingTree } from '../../../contracts';
import type { SessionRepository } from '../../../contracts/repositories/commands';
import { recordTree } from '../shared/record-tree';

interface RecordCheckInput {
  readonly command: string;
  readonly isInBackground: boolean;
  readonly session: SessionId;
  readonly sessionRepository: SessionRepository;
  readonly workingTree: WorkingTree;
}

const recordCheck = (input: RecordCheckInput): void => {
  if (!ShellCommand.runsCheck(input.command)) {
    return;
  }

  recordTree({
    mark: checkMarkOf(input),
    session: input.session,
    sessionRepository: input.sessionRepository,
    workingTree: input.workingTree,
  });
};

export { recordCheck };
