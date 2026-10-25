import { describe, expect, it } from 'bun:test';

import { StepStatus, Tone } from '@droneey/design-cli';

import { BlockId, RuleSlug } from '#/kernel/value-objects';
import { noteSection } from '#/shared/cli';

import type { BlockFinding, Validation } from '../../../domain/use-cases/queries/check';
import { RequiresCode } from '../../../domain/use-cases/queries/check';
import { findingTextOf } from '../finding-text.utils';
import { blocksOutcomeOf, blocksSectionsOf } from '../report.utils';

const finding: BlockFinding = {
  code: RequiresCode.RequiresItself,
  details: {},
  path: 'blocks/domains/ui/ui.md',
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
        {
          left: {
            block: BlockId.create('x'),
            slug: RuleSlug.create('a'),
          },
          right: {
            block: BlockId.create('y'),
            slug: RuleSlug.create('b'),
          },
        },
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
          `blocks/domains/ui/ui.md: ${findingTextOf(finding)} [requires-itself]`,
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

  it('should give the findings by file, then by code, then by their text', () => {
    // Arrange
    const webgl: BlockFinding = {
      code: RequiresCode.RequiresNoBlock,
      details: {
        required: BlockId.create('webgl'),
      },
      path: 'blocks/domains/ui/ui.md',
    };
    const i18n: BlockFinding = {
      code: RequiresCode.RequiresItself,
      details: {},
      path: 'blocks/domains/i18n/i18n.md',
    };
    const canvas: BlockFinding = {
      code: RequiresCode.RequiresNoBlock,
      details: {
        required: BlockId.create('canvas'),
      },
      path: 'blocks/domains/ui/ui.md',
    };
    const validation = {
      advice: [],
      findings: [
        webgl,
        i18n,
        canvas,
        finding,
      ],
    } satisfies Validation;

    // Act
    const sections = blocksSectionsOf(validation);

    // Assert
    expect(sections).toStrictEqual([
      noteSection({
        lines: [
          `blocks/domains/i18n/i18n.md: ${findingTextOf(i18n)} [requires-itself]`,
          `blocks/domains/ui/ui.md: ${findingTextOf(finding)} [requires-itself]`,
          `blocks/domains/ui/ui.md: ${findingTextOf(canvas)} [requires-no-block]`,
          `blocks/domains/ui/ui.md: ${findingTextOf(webgl)} [requires-no-block]`,
        ],
        title: '4 findings in the blocks',
        tone: Tone.Error,
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
