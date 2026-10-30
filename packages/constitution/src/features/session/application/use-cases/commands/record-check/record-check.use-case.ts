import { projectCheck } from '#/kernel/constants';

import type { WorkingTree } from '../../../contracts';
import type { SessionCommandRepository } from '../../../contracts/repositories/commands';
import { SessionMark } from '../../../../domain/entities';
import type { SessionId } from '../../../../domain/value-objects';
import { recordTree } from '../shared/record-tree';

const COMMAND_SEPARATOR = /&&|;/;
const RUNNERS: readonly string[] = [
  'bun run ',
  'bunx ',
  'npx ',
  'mise exec -- ',
] as const;

const withoutRunner = (step: string): string => {
  const runner = RUNNERS.find((prefix) => step.startsWith(prefix));

  return runner === undefined ? step : step.slice(runner.length);
};

const runsCheck = (command: string): boolean =>
  command.split(COMMAND_SEPARATOR).some((part) => {
    const step = withoutRunner(part.trim());

    return step === projectCheck || step.startsWith(`${projectCheck} `);
  });

interface RecordCheckInput {
  readonly command: string;
  readonly session: SessionId;
  readonly sessions: SessionCommandRepository;
  readonly workingTree: WorkingTree;
}

const recordCheck = (input: RecordCheckInput): void => {
  if (!runsCheck(input.command)) {
    return;
  }

  recordTree({
    ...input,
    mark: SessionMark.Checked,
  });
};

export { recordCheck };
