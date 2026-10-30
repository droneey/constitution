import { describe, expect, it } from 'bun:test';

import { StepStatus, Tone } from '@droneey/design-cli';

import { goldenFileText, goldenOf } from '#/__tests__/golden.fixtures';
import { notesTextOf } from '#/__tests__/notes-text.fixtures';
import { BlockId } from '#/kernel/value-objects';
import { noteSection } from '#/shared/cli';

import type { PresetsFinding } from '../../../domain/entities';
import { PresetsCode } from '../../../domain/entities';
import { presetsSkippedStep, presetsStepOf } from '../presets-step.utils';

const misplaced: PresetsFinding = {
  code: PresetsCode.PresetFileMisplaced,
  details: {},
  path: 'presets/b.yaml',
};
const unknown: PresetsFinding = {
  code: PresetsCode.UnknownReader,
  details: {
    reader: BlockId.create('gone'),
  },
  path: 'presets/a.yaml',
};
const unparsed: PresetsFinding = {
  code: PresetsCode.PresetFileUnparsed,
  details: {},
  path: 'presets/a.yaml',
};
const found = [
  unknown,
  misplaced,
  unparsed,
];

describe('presetsStepOf', () => {
  it('should word the step and the report as the golden file shows them', async () => {
    // Act
    const golden = goldenOf({
      'outcome when no blocks load': presetsSkippedStep.outcome.detail,
      'outcome when the presets have findings': presetsStepOf(found).outcome.detail,
      'outcome when the presets are sound': presetsStepOf([]).outcome.detail,
      sections: notesTextOf(presetsStepOf(found).sections),
    });

    // Assert
    expect(golden).toBe(
      await goldenFileText(new URL('presets-step.golden.txt', import.meta.url), golden),
    );
  });

  it.each([
    {
      condition: 'every preset file is sound',
      given: [],
      isFailed: false,
      status: StepStatus.Done,
    },
    {
      condition: 'the presets have findings',
      given: found,
      isFailed: true,
      status: StepStatus.Failed,
    },
  ])('should end the step as $status when $condition', ({ given, isFailed, status }) => {
    // Act
    const step = presetsStepOf(given);

    // Assert
    expect({
      isFailed: step.isFailed,
      status: step.outcome.status,
    }).toStrictEqual({
      isFailed,
      status,
    });
  });

  it('should give the findings as one note of errors, a line for each', () => {
    // Act
    const step = presetsStepOf(found);

    // Assert
    expect(step.sections).toStrictEqual([
      noteSection({
        lines: [
          expect.any(String),
          expect.any(String),
          expect.any(String),
        ],
        title: expect.any(String),
        tone: Tone.Error,
      }),
    ]);
  });

  it('should give nothing when every preset file is sound', () => {
    // Act
    const step = presetsStepOf([]);

    // Assert
    expect(step.sections).toStrictEqual([]);
  });
});

describe('presetsSkippedStep', () => {
  it('should skip the step without failing the run and give no section', () => {
    // Act
    const { isFailed, outcome, sections } = presetsSkippedStep;

    // Assert
    expect({
      isFailed,
      sections,
      status: outcome.status,
    }).toStrictEqual({
      isFailed: false,
      sections: [],
      status: StepStatus.Skipped,
    });
  });
});
