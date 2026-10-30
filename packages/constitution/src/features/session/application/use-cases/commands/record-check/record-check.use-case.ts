import { SessionMark } from '../../../../domain/session/entities';
import type { SessionId } from '../../../../domain/session/value-objects';
import { ShellCommand } from '../../../../domain/shell-command/value-objects';
import type { WorkingTree } from '../../../contracts';
import type { SessionCommandRepository } from '../../../contracts/repositories/commands';
import { recordTree } from '../shared/record-tree';

interface RecordCheckInput {
  readonly command: string;
  readonly session: SessionId;
  readonly sessions: SessionCommandRepository;
  readonly workingTree: WorkingTree;
}

const recordCheck = (input: RecordCheckInput): void => {
  if (!ShellCommand.runsCheck(input.command)) {
    return;
  }

  recordTree({
    ...input,
    mark: SessionMark.Checked,
  });
};

export { recordCheck };
