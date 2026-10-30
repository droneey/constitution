import { describe, expect, it } from 'bun:test';

import { StepStatus } from '@droneey/design-cli';

import { createFakeContext } from '#/__tests__/command-context.fake';
import { goldenFileText, goldenOf } from '#/__tests__/golden.fixtures';
import { AbsolutePath } from '#/kernel/value-objects';

import type { ProjectUnread } from '../../../domain/entities';
import { ProjectReadStatus } from '../../../domain/entities';
import { failUnreadStep, unreadOutcomeOf } from '../project-unread.utils';

const noProject: ProjectUnread = {
  status: ProjectReadStatus.NoProject,
};
const releaseMissing: ProjectUnread = {
  releaseFolderPath: AbsolutePath.create('/work/project/.droneey/constitution'),
  status: ProjectReadStatus.ReleaseMissing,
};
const configUnparsed: ProjectUnread = {
  lines: [
    3,
    7,
  ],
  status: ProjectReadStatus.ConfigUnparsed,
};

describe('unreadOutcomeOf', () => {
  it('should word why the project cannot be read as the golden file shows it', async () => {
    // Act
    const golden = goldenOf({
      'constitution.yaml unparsed': unreadOutcomeOf(configUnparsed).detail,
      'no project': unreadOutcomeOf(noProject).detail,
      'release missing': unreadOutcomeOf(releaseMissing).detail,
    });

    // Assert
    expect(golden).toBe(
      await goldenFileText(new URL('project-unread.golden.txt', import.meta.url), golden),
    );
  });

  it.each<{
    condition: string;
    status: StepStatus;
    statusWithoutProject?: StepStatus;
    unread: ProjectUnread;
  }>([
    {
      condition: 'no project is there',
      status: StepStatus.Failed,
      unread: noProject,
    },
    {
      condition: 'no project is there and the caller skips such a step',
      status: StepStatus.Skipped,
      statusWithoutProject: StepStatus.Skipped,
      unread: noProject,
    },
    {
      condition: 'the release is missing and the caller skips a step without a project',
      status: StepStatus.Failed,
      statusWithoutProject: StepStatus.Skipped,
      unread: releaseMissing,
    },
    {
      condition: 'constitution.yaml does not parse',
      status: StepStatus.Failed,
      unread: configUnparsed,
    },
  ])(
    'should end the step as $status when $condition',
    ({ status, statusWithoutProject, unread }) => {
      // Act
      const outcome = unreadOutcomeOf(unread, statusWithoutProject);

      // Assert
      expect(outcome.status).toBe(status);
    },
  );
});

describe('failUnreadStep', () => {
  it('should show one failed step and end the run as failed', async () => {
    // Arrange
    const { context, record } = createFakeContext();

    // Act
    await failUnreadStep(context, releaseMissing);

    // Assert
    expect({
      failures: record().failures,
      steps: record().ran.map((ran) => ran.outcome),
    }).toStrictEqual({
      failures: 1,
      steps: [
        unreadOutcomeOf(releaseMissing),
      ],
    });
  });
});
