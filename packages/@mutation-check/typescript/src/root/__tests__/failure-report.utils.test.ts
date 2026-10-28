import { describe, expect, it } from 'bun:test';

import {
  BranchError,
  BranchFailure,
  ConfigurationError,
  ConfigurationFailure,
  MutationRunError,
  MutationRunFailure,
} from '#/features/targets';
import { reportLineOf, unexpectedErrorMessage } from '#/kernel/messages';
import { AbsolutePath } from '#/kernel/value-objects';

import { failureReportOf } from '../failure-report.utils.ts';

const knownFailures = [
  {
    error: new BranchError({
      code: BranchFailure.ToolNotRun,
      command: {
        args: [
          'diff',
        ],
        folderPath: AbsolutePath.create('/work/unit'),
        toolName: 'git',
      },
    }),
    kind: 'the branch cannot be read',
  },
  {
    error: new ConfigurationError({
      code: ConfigurationFailure.Missing,
      fileNames: [
        'stryker.config.json',
      ],
    }),
    kind: 'the configuration cannot tell the files to mutate',
  },
  {
    error: new MutationRunError({
      code: MutationRunFailure.ToolNotRun,
      toolName: 'stryker',
    }),
    kind: 'the mutation tool does not run to its end',
  },
];

describe('failureReportOf', () => {
  it.each(knownFailures)('should report the failure itself when $kind', ({ error }) => {
    // Act
    const report = failureReportOf(error);

    // Assert
    expect(report).toBe(reportLineOf(error.message));
  });

  it('should ask for a report of an error it does not know', () => {
    // Arrange
    const error = new TypeError('x is not a function');

    // Act
    const report = failureReportOf(error);

    // Assert
    expect(report).toBe(reportLineOf(unexpectedErrorMessage(error)));
  });
});
