import { describe, expect, it } from 'bun:test';

import { StepStatus, Tone } from '@droneey/design-cli';

import type { TaskOutcome } from '#/shared/cli';
import { noteSection } from '#/shared/cli';

import type { ApplyReport, PresetsFinding } from '../../../domain/entities';
import { PresetsCode } from '../../../domain/entities';
import { applyOutcomeOf, applySectionsOf } from '../apply-report.utils';
import { presetsFindingTextOf } from '../presets-finding-texts.utils';

const loosened: PresetsFinding = {
  code: PresetsCode.Loosened,
  details: {
    setting: 'formatter.width',
    wanted: '100',
  },
  path: 'biome.json',
};

const quiet: ApplyReport = {
  added: [],
  deleted: [],
  findings: [],
  removed: [],
  units: [],
  written: [],
};

describe('applyOutcomeOf', () => {
  it.each<{
    condition: string;
    outcome: TaskOutcome;
    report: ApplyReport | undefined;
  }>([
    {
      condition: 'no project lies around the folder',
      outcome: {
        detail: 'no constitution.yaml in this folder or above it',
        status: StepStatus.Failed,
      },
      report: undefined,
    },
    {
      condition: 'it wrote a file and found nothing wrong',
      outcome: {
        detail: '1 file written',
        status: StepStatus.Done,
      },
      report: {
        ...quiet,
        written: [
          'biome.json',
        ],
      },
    },
    {
      condition: 'it found something wrong',
      outcome: {
        detail: '0 files written, 2 findings',
        status: StepStatus.Failed,
      },
      report: {
        ...quiet,
        findings: [
          loosened,
          loosened,
        ],
      },
    },
  ])('should end the step as $outcome.status when $condition', ({ outcome, report }) => {
    // Act
    const given = applyOutcomeOf(report);

    // Assert
    expect(given).toStrictEqual(outcome);
  });
});

describe('applySectionsOf', () => {
  it('should give what it wrote, deleted, removed and added, then what it found', () => {
    // Arrange
    const report: ApplyReport = {
      added: [
        {
          file: 'biome.json',
          setting: 'test.randomize',
        },
      ],
      deleted: [
        'notes.json',
      ],
      findings: [
        loosened,
      ],
      removed: [
        {
          file: 'biome.json',
          setting: 'files "dist"',
        },
        {
          file: '.gitignore',
          setting: '"dist/"',
        },
      ],
      units: [
        '',
      ],
      written: [
        'biome.json',
        'constitution.lock',
      ],
    };

    // Act
    const sections = applySectionsOf(report);

    // Assert
    expect(sections).toStrictEqual([
      noteSection({
        lines: [
          'biome.json',
          'constitution.lock',
        ],
        title: '2 files written',
        tone: Tone.Info,
      }),
      noteSection({
        lines: [
          'notes.json',
        ],
        title: '1 file deleted, which the apply created and nothing holds any longer',
        tone: Tone.Info,
      }),
      noteSection({
        lines: [
          'biome.json: files "dist"',
          '.gitignore: "dist/"',
        ],
        title: '2 settings removed, which no entry gives any longer',
        tone: Tone.Info,
      }),
      noteSection({
        lines: [
          'biome.json: test.randomize',
        ],
        title: '1 setting added as defaults to files that were there',
        tone: Tone.Info,
      }),
      noteSection({
        lines: [
          `biome.json: ${presetsFindingTextOf(loosened)} [loosened]`,
        ],
        title: '1 finding in the presets',
        tone: Tone.Error,
      }),
    ]);
  });

  it.each([
    {
      condition: 'no project lies around the folder',
      report: undefined,
    },
    {
      condition: 'it changed nothing and found nothing',
      report: quiet,
    },
  ])('should give nothing when $condition', ({ report }) => {
    // Act
    const sections = applySectionsOf(report);

    // Assert
    expect(sections).toStrictEqual([]);
  });
});
