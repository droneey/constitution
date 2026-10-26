import { describe, expect, it } from 'bun:test';

import { StepStatus, Tone } from '@droneey/design-cli';

import type { TaskOutcome } from '#/shared/cli';
import { noteSection } from '#/shared/cli';

import type { PresetsFinding } from '../../../domain/entities';
import { PresetsCode } from '../../../domain/entities';
import {
  cataloguesOutcomeOf,
  cataloguesSectionsOf,
  cataloguesStepOf,
} from '../catalogues-report.utils';
import { presetsFindingTextOf } from '../presets-finding-texts.utils';

const misplaced: PresetsFinding = {
  code: PresetsCode.CatalogueMisplaced,
  details: {},
  path: 'presets/b.yaml',
};
const unknown: PresetsFinding = {
  code: PresetsCode.UnknownReader,
  details: {
    reader: 'gone',
  },
  path: 'presets/a.yaml',
};
const unparsed: PresetsFinding = {
  code: PresetsCode.CatalogueUnparsed,
  details: {},
  path: 'presets/a.yaml',
};

describe('cataloguesOutcomeOf', () => {
  it.each<{
    condition: string;
    findings: readonly PresetsFinding[] | undefined;
    outcome: TaskOutcome;
  }>([
    {
      condition: 'no blocks load beside the catalogues',
      findings: undefined,
      outcome: {
        detail: 'no blocks to check the catalogues against',
        status: StepStatus.Skipped,
      },
    },
    {
      condition: 'every catalogue is sound',
      findings: [],
      outcome: {
        detail: 'every catalogue is sound',
        status: StepStatus.Done,
      },
    },
    {
      condition: 'the catalogues have findings',
      findings: [
        misplaced,
      ],
      outcome: {
        detail: '1 finding',
        status: StepStatus.Failed,
      },
    },
  ])('should end the step as $outcome.status when $condition', ({ findings, outcome }) => {
    // Act
    const given = cataloguesOutcomeOf(findings);

    // Assert
    expect(given).toStrictEqual(outcome);
  });
});

describe('cataloguesSectionsOf', () => {
  it('should give each finding by its path, then its code, then its text, closing with its code', () => {
    // Arrange
    const findings = [
      unknown,
      misplaced,
      unparsed,
    ];

    // Act
    const sections = cataloguesSectionsOf(findings);

    // Assert
    expect(sections).toStrictEqual([
      noteSection({
        lines: [
          `presets/a.yaml: ${presetsFindingTextOf(unparsed)} [catalogue-unparsed]`,
          `presets/a.yaml: ${presetsFindingTextOf(unknown)} [unknown-reader]`,
          `presets/b.yaml: ${presetsFindingTextOf(misplaced)} [catalogue-misplaced]`,
        ],
        title: '3 findings in the catalogues',
        tone: Tone.Error,
      }),
    ]);
  });

  it.each([
    {
      condition: 'no blocks load beside the catalogues',
      findings: undefined,
    },
    {
      condition: 'every catalogue is sound',
      findings: [],
    },
  ])('should give nothing when $condition', ({ findings }) => {
    // Act
    const sections = cataloguesSectionsOf(findings);

    // Assert
    expect(sections).toStrictEqual([]);
  });
});

describe('cataloguesStepOf', () => {
  it.each<{
    condition: string;
    given: readonly PresetsFinding[] | undefined;
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
      given: [],
      isFailed: false,
      status: StepStatus.Done,
    },
    {
      condition: 'something was found',
      given: [
        misplaced,
      ],
      isFailed: true,
      status: StepStatus.Failed,
    },
  ])(
    'should present the step as its outcome and sections say when $condition',
    ({ given, isFailed, status }) => {
      // Act
      const step = cataloguesStepOf(given);

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
