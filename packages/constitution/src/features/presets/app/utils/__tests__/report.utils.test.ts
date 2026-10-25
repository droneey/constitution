import { describe, expect, it } from 'bun:test';

import { StepStatus, Tone } from '@droneey/design-cli';

import type { ProjectWarning } from '#/kernel/entities';
import { WarningKind } from '#/kernel/entities';
import type { TaskOutcome } from '#/shared/cli';
import { noteSection, warningTextOf } from '#/shared/cli';

import { presetsOutcomeOf, presetsSectionsOf } from '../report.utils';

const warning: ProjectWarning = {
  details: {
    name: 'nope',
  },
  kind: WarningKind.NameUnknown,
};

describe('presetsOutcomeOf', () => {
  it.each<{
    condition: string;
    outcome: TaskOutcome;
    statusWithoutProject?: StepStatus;
    warnings: readonly ProjectWarning[] | undefined;
  }>([
    {
      condition: 'no project lies around the folder',
      outcome: {
        detail: 'no constitution.yaml in this folder or above it',
        status: StepStatus.Skipped,
      },
      warnings: undefined,
    },
    {
      condition: 'no project lies around the folder and the caller ends such a step failed',
      outcome: {
        detail: 'no constitution.yaml in this folder or above it',
        status: StepStatus.Failed,
      },
      statusWithoutProject: StepStatus.Failed,
      warnings: undefined,
    },
    {
      condition: 'the project is sound',
      outcome: {
        detail: 'constitution.yaml and its wiring are sound',
        status: StepStatus.Done,
      },
      warnings: [],
    },
    {
      condition: 'the project has warnings',
      outcome: {
        detail: '1 warning',
        status: StepStatus.Warned,
      },
      warnings: [
        warning,
      ],
    },
  ])(
    'should end the step as $outcome.status when $condition',
    ({ outcome, statusWithoutProject, warnings }) => {
      // Act
      const given = presetsOutcomeOf(warnings, statusWithoutProject);

      // Assert
      expect(given).toStrictEqual(outcome);
    },
  );
});

describe('presetsSectionsOf', () => {
  it('should give each warning by its code when the project has some', () => {
    // Arrange
    const warnings = [
      warning,
      warning,
    ];

    // Act
    const sections = presetsSectionsOf(warnings);

    // Assert
    expect(sections).toStrictEqual([
      noteSection({
        lines: [
          `blocks: ${warningTextOf(warning)}`,
          `blocks: ${warningTextOf(warning)}`,
        ],
        title: '2 warnings in the project',
        tone: Tone.Warning,
      }),
    ]);
  });

  it.each([
    {
      condition: 'no project lies around the folder',
      warnings: undefined,
    },
    {
      condition: 'the project is sound',
      warnings: [],
    },
  ])('should give nothing when $condition', ({ warnings }) => {
    // Act
    const sections = presetsSectionsOf(warnings);

    // Assert
    expect(sections).toStrictEqual([]);
  });
});
