import { describe, expect, it } from 'bun:test';

import { StepStatus, Tone } from '@droneey/design-cli';

import type { ProjectWarning } from '#/kernel/entities';
import { WarningKind } from '#/kernel/entities';
import type { TaskOutcome } from '#/shared/cli';
import { noteSection, warningTextOf } from '#/shared/cli';

import type { ConfigurationsCheck, PresetsFinding } from '../../../domain/entities';
import { PresetsCode } from '../../../domain/entities';
import {
  configurationsOutcomeOf,
  configurationsSectionsOf,
  configurationsStepOf,
} from '../configurations-report.utils';
import { presetsFindingTextOf } from '../presets-finding-texts.utils';

const warning: ProjectWarning = {
  details: {
    name: 'nope',
  },
  kind: WarningKind.NameUnknown,
};
const finding: PresetsFinding = {
  code: PresetsCode.Stale,
  details: {
    settings: [
      'width',
    ],
  },
  path: 'biome.json',
};
const sound: ConfigurationsCheck = {
  findings: [],
  warnings: [],
};

describe('configurationsOutcomeOf', () => {
  it.each<{
    checked: ConfigurationsCheck | undefined;
    condition: string;
    outcome: TaskOutcome;
    statusWithoutProject?: StepStatus;
  }>([
    {
      checked: undefined,
      condition: 'no project lies around the folder',
      outcome: {
        detail: 'no constitution.yaml in this folder or above it',
        status: StepStatus.Skipped,
      },
    },
    {
      checked: undefined,
      condition: 'no project lies around the folder and the caller ends such a step failed',
      outcome: {
        detail: 'no constitution.yaml in this folder or above it',
        status: StepStatus.Failed,
      },
      statusWithoutProject: StepStatus.Failed,
    },
    {
      checked: sound,
      condition: 'the project is sound',
      outcome: {
        detail: 'constitution.yaml and its configurations are sound',
        status: StepStatus.Done,
      },
    },
    {
      checked: {
        findings: [],
        warnings: [
          warning,
        ],
      },
      condition: 'the project has a warning',
      outcome: {
        detail: '1 warning',
        status: StepStatus.Warned,
      },
    },
    {
      checked: {
        findings: [
          finding,
          finding,
        ],
        warnings: [],
      },
      condition: 'the presets find something',
      outcome: {
        detail: '2 findings',
        status: StepStatus.Warned,
      },
    },
    {
      checked: {
        findings: [
          finding,
        ],
        warnings: [
          warning,
        ],
      },
      condition: 'both warn',
      outcome: {
        detail: '1 warning, 1 finding',
        status: StepStatus.Warned,
      },
    },
  ])(
    'should end the step as $outcome.status when $condition',
    ({ checked, outcome, statusWithoutProject }) => {
      // Act
      const given = configurationsOutcomeOf(checked, statusWithoutProject);

      // Assert
      expect(given).toStrictEqual(outcome);
    },
  );
});

describe('configurationsSectionsOf', () => {
  it('should give each warning by its code, then each finding of the presets, when the project has both', () => {
    // Arrange
    const checked = {
      findings: [
        finding,
      ],
      warnings: [
        warning,
        warning,
      ],
    };

    // Act
    const sections = configurationsSectionsOf(checked);

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
      noteSection({
        lines: [
          `biome.json: ${presetsFindingTextOf(finding)} [stale]`,
        ],
        title: '1 finding in the configurations',
        tone: Tone.Warning,
      }),
    ]);
  });

  it.each([
    {
      checked: undefined,
      condition: 'no project lies around the folder',
    },
    {
      checked: sound,
      condition: 'the project is sound',
    },
  ])('should give nothing when $condition', ({ checked }) => {
    // Act
    const sections = configurationsSectionsOf(checked);

    // Assert
    expect(sections).toStrictEqual([]);
  });
});

describe('configurationsStepOf', () => {
  it.each<{
    condition: string;
    given: ConfigurationsCheck | undefined;
    isFailed: boolean;
    status: StepStatus;
  }>([
    {
      condition: 'nothing was checked',
      given: undefined,
      isFailed: false,
      status: StepStatus.Skipped,
    },
    {
      condition: 'nothing was found',
      given: sound,
      isFailed: false,
      status: StepStatus.Done,
    },
    {
      condition: 'something was found',
      given: {
        findings: [],
        warnings: [
          warning,
        ],
      },
      isFailed: true,
      status: StepStatus.Warned,
    },
  ])(
    'should present the step as its outcome and sections say when $condition',
    ({ given, isFailed, status }) => {
      // Act
      const step = configurationsStepOf(given);

      // Assert
      expect({
        isFailed: step.isFailed,
        sections: step.sections.length,
        status: step.outcome.status,
      }).toStrictEqual({
        isFailed,
        sections: isFailed ? 1 : 0,
        status,
      });
    },
  );
});
