import { projectCheck } from '#/kernel/constants';

import type { WorkingTree } from '../../../contracts';
import type { SessionCommandRepository } from '../../../contracts/repositories/commands';
import { SessionMark } from '../../../entities';
import type { SessionId } from '../../../value-objects';
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

// Whether one of the commands a shell line runs in turn is the check, alone or with its options.
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

/**
 * Records the fingerprint of the tree as checked when a command the agent ran is the project's
 * check; records nothing when it is not, the session keeps no rules, or git cannot report the tree.
 */
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
