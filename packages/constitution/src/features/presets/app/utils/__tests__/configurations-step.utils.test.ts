import { describe, expect, it } from 'bun:test';

import { StepStatus, Tone } from '@droneey/design-cli';

import { goldenFileText, goldenOf } from '#/__tests__/golden.fixtures';
import { notesTextOf } from '#/__tests__/notes-text.fixtures';
import { ProjectWarning, WarningKind } from '#/kernel/entities';
import { AbsolutePath } from '#/kernel/value-objects';
import { noteSection, warningTextOf } from '#/shared/cli';

import type { ConfigurationsCheck, PresetsFinding } from '../../../domain/entities';
import { PresetsCode, ProjectRead, ProjectReadStatus } from '../../../domain/entities';
import { warningLineMessage } from '../configurations-step.messages';
import { configurationsStepOf } from '../configurations-step.utils';
import { findingLinesOf } from '../finding-lines.utils';

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
const warned: ConfigurationsCheck = {
  findings: [],
  warnings: [
    warning,
  ],
};
const found: ConfigurationsCheck = {
  findings: [
    finding,
    finding,
  ],
  warnings: [],
};
const bothWarn: ConfigurationsCheck = {
  findings: [
    finding,
  ],
  warnings: [
    warning,
    warning,
  ],
};
const noProject: ProjectRead<never> = {
  status: ProjectReadStatus.NoProject,
};
const releaseMissing: ProjectRead<never> = {
  releaseFolderPath: AbsolutePath.create('/work/project/.droneey/constitution'),
  status: ProjectReadStatus.ReleaseMissing,
};

const detailOf = (read: ProjectRead<ConfigurationsCheck>): string | undefined =>
  configurationsStepOf(read).outcome.detail;

describe('configurationsStepOf', () => {
  it('should word the step and the report as the golden file shows them', async () => {
    // Act
    const golden = goldenOf({
      'outcome when both warn': detailOf(ProjectRead.opened(bothWarn)),
      'outcome when no project': detailOf(noProject),
      'outcome when the presets find something': detailOf(ProjectRead.opened(found)),
      'outcome when the project has a warning': detailOf(ProjectRead.opened(warned)),
      'outcome when the project is sound': detailOf(ProjectRead.opened(sound)),
      sections: notesTextOf(configurationsStepOf(ProjectRead.opened(bothWarn)).sections),
    });

    // Assert
    expect(golden).toBe(
      await goldenFileText(new URL('configurations-step.golden.txt', import.meta.url), golden),
    );
  });

  it.each<{
    checked: ProjectRead<ConfigurationsCheck>;
    condition: string;
    status: StepStatus;
    statusWithoutProject?: StepStatus;
  }>([
    {
      checked: noProject,
      condition: 'no project lies around the folder',
      status: StepStatus.Skipped,
    },
    {
      checked: noProject,
      condition: 'no project lies around the folder and the caller ends such a step failed',
      status: StepStatus.Failed,
      statusWithoutProject: StepStatus.Failed,
    },
    {
      checked: releaseMissing,
      condition: 'the project cannot be read',
      status: StepStatus.Failed,
    },
    {
      checked: ProjectRead.opened(sound),
      condition: 'the project is sound',
      status: StepStatus.Done,
    },
    {
      checked: ProjectRead.opened(bothWarn),
      condition: 'both warn',
      status: StepStatus.Warned,
    },
    {
      checked: ProjectRead.opened({
        findings: [
          finding,
        ],
        warnings: [
          warning,
        ],
      }),
      condition: 'as many findings as warnings are found',
      status: StepStatus.Warned,
    },
  ])(
    'should end the step as $status when $condition',
    ({ checked, status, statusWithoutProject }) => {
      // Act
      const step = configurationsStepOf(checked, statusWithoutProject);

      // Assert
      expect(step.outcome.status).toBe(status);
    },
  );

  it('should give each warning by its code, then each finding of the presets, when the project has both', () => {
    // Act
    const step = configurationsStepOf(ProjectRead.opened(bothWarn));

    // Assert
    expect(step.sections).toStrictEqual([
      noteSection({
        lines: [
          warningLineMessage({
            code: ProjectWarning.codeOf(warning),
            text: warningTextOf(warning),
          }),
          warningLineMessage({
            code: ProjectWarning.codeOf(warning),
            text: warningTextOf(warning),
          }),
        ],
        title: expect.any(String),
        tone: Tone.Warning,
      }),
      noteSection({
        lines: findingLinesOf([
          finding,
        ]),
        title: expect.any(String),
        tone: Tone.Warning,
      }),
    ]);
  });

  it.each([
    {
      checked: noProject,
      condition: 'no project lies around the folder',
    },
    {
      checked: ProjectRead.opened(sound),
      condition: 'the project is sound',
    },
  ])('should give nothing when $condition', ({ checked }) => {
    // Act
    const step = configurationsStepOf(checked);

    // Assert
    expect(step.sections).toStrictEqual([]);
  });

  it.each<{
    condition: string;
    given: ProjectRead<ConfigurationsCheck>;
    isFailed: boolean;
  }>([
    {
      condition: 'no project was there to check',
      given: noProject,
      isFailed: false,
    },
    {
      condition: 'the project could not be read',
      given: releaseMissing,
      isFailed: true,
    },
    {
      condition: 'nothing was found',
      given: ProjectRead.opened(sound),
      isFailed: false,
    },
    {
      condition: 'something was found',
      given: ProjectRead.opened(warned),
      isFailed: true,
    },
  ])('should fail the step: $isFailed, when $condition', ({ given, isFailed }) => {
    // Act
    const step = configurationsStepOf(given);

    // Assert
    expect(step.isFailed).toBe(isFailed);
  });
});
