import { describe, expect, it } from 'bun:test';

import { StepStatus, Tone } from '@droneey/design-cli';

import { noteSection } from '#/shared/cli';

import { blocksOutcomeOf, blocksSectionsOf } from '../report.utils';

const finding = {
  code: 'missing-why',
  message: 'a rule has no Why',
  path: 'blocks/core/core.md',
};

describe('blocksOutcomeOf', () => {
  it.each([
    {
      condition: 'the folder holds no blocks',
      outcome: {
        detail: 'no blocks in this folder',
        status: StepStatus.Skipped,
      },
      validation: undefined,
    },
    {
      condition: 'every block is sound',
      outcome: {
        detail: 'every block is sound',
        status: StepStatus.Done,
      },
      validation: {
        advice: [],
        findings: [],
      },
    },
    {
      condition: 'the blocks have findings',
      outcome: {
        detail: '2 findings',
        status: StepStatus.Failed,
      },
      validation: {
        advice: [],
        findings: [
          finding,
          finding,
        ],
      },
    },
  ])('should end the step as $outcome.status when $condition', ({ outcome, validation }) => {
    // Arrange
    const checked = validation;

    // Act
    const given = blocksOutcomeOf(checked);

    // Assert
    expect(given).toStrictEqual(outcome);
  });
});

describe('blocksSectionsOf', () => {
  it('should give the findings, each closed by its code, then the advice when both are there', () => {
    // Arrange
    const validation = {
      advice: [
        'similar rules: a (x) and b (y)',
      ],
      findings: [
        finding,
      ],
    };

    // Act
    const sections = blocksSectionsOf(validation);

    // Assert
    expect(sections).toStrictEqual([
      noteSection({
        lines: [
          'blocks/core/core.md: a rule has no Why [missing-why]',
        ],
        title: '1 finding in the blocks',
        tone: Tone.Error,
      }),
      noteSection({
        lines: [
          'similar rules: a (x) and b (y)',
        ],
        title: 'Advice on the blocks',
        tone: Tone.Info,
      }),
    ]);
  });

  it.each([
    {
      condition: 'the folder holds no blocks',
      validation: undefined,
    },
    {
      condition: 'the blocks are sound and nothing is advised',
      validation: {
        advice: [],
        findings: [],
      },
    },
  ])('should give nothing when $condition', ({ validation }) => {
    // Arrange
    const checked = validation;

    // Act
    const sections = blocksSectionsOf(checked);

    // Assert
    expect(sections).toStrictEqual([]);
  });
});
