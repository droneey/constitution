import { StepStatus } from '@droneey/design-cli';

import type { CommandContext, TaskOutcome } from '#/shared/cli';
import { atLinesText, NO_PROJECT, releaseMissingMessage } from '#/shared/cli';

import type { ProjectUnread } from '../../domain/entities';
import { ProjectReadStatus } from '../../domain/entities';
import { configUnparsedMessage } from './project-unread.messages';

const unreadTextOf = (unread: ProjectUnread): string => {
  switch (unread.status) {
    case ProjectReadStatus.NoProject:
      return NO_PROJECT;
    case ProjectReadStatus.ReleaseMissing:
      return releaseMissingMessage(unread.releaseFolderPath);
    case ProjectReadStatus.ConfigUnparsed:
      return configUnparsedMessage(atLinesText(unread.lines));
    // Stryker disable next-line ConditionalExpression: no status reaches the default, which only the compiler reads
    default:
      return unread satisfies never;
  }
};

/** A project that cannot be read fails its step; where none is, the step takes the status given. */
const unreadOutcomeOf = (
  unread: ProjectUnread,
  statusWithoutProject: StepStatus = StepStatus.Failed,
): TaskOutcome => ({
  detail: unreadTextOf(unread),
  status: unread.status === ProjectReadStatus.NoProject ? statusWithoutProject : StepStatus.Failed,
});

/** Shows the presets' step failed where the project cannot be read, and fails the run. */
const failUnreadStep = async (
  context: Pick<CommandContext, 'renderer' | 'setFailed'>,
  unread: ProjectUnread,
): Promise<void> => {
  await context.renderer.run({
    label: 'Presets',
    outcomeOf: (read: ProjectUnread) => unreadOutcomeOf(read),
    run: () => unread,
  });
  context.setFailed();
};

export { failUnreadStep, unreadOutcomeOf };
