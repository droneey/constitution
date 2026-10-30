import { describe, expect, it } from 'bun:test';

import { StepStatus, Tone } from '@droneey/design-cli';

import { goldenFileText, goldenOf } from '#/__tests__/golden.fixtures';
import { notesTextOf } from '#/__tests__/notes-text.fixtures';
import type { BlockModel } from '#/kernel/entities';
import { BlockId, RuleSlug } from '#/kernel/value-objects';
import { noteSection } from '#/shared/cli';

import type { BlockFinding, Validation } from '../../../domain/services';
import { RequiresCode, ValidationStage } from '../../../domain/services';
import { findingTextOf } from '../finding-text.utils';
import { adviceMessage, SOUND } from '../report.messages';
import { blocksOutcomeOf, blocksSectionsOf } from '../report.utils';

const finding: BlockFinding = {
  code: RequiresCode.RequiresItself,
  details: {},
  path: 'blocks/domains/ui/ui.md',
};
const model: BlockModel = {
  blocks: [],
  roles: [],
  rules: [],
};
const advice = {
  left: {
    block: BlockId.create('x'),
    slug: RuleSlug.create('a'),
  },
  right: {
    block: BlockId.create('y'),
    slug: RuleSlug.create('b'),
  },
};
const advised = {
  advice: [
    advice,
  ],
  findings: [
    finding,
  ],
  model,
  stage: ValidationStage.Checked,
} satisfies Validation;

describe('blocksOutcomeOf', () => {
  it.each([
    {
      condition: 'every block is sound',
      outcome: {
        detail: SOUND,
        status: StepStatus.Done,
      },
      validation: {
        findings: [],
        stage: ValidationStage.Unloaded,
      },
    },
    {
      condition: 'the blocks have findings',
      outcome: {
        detail: '2 findings',
        status: StepStatus.Failed,
      },
      validation: {
        findings: [
          finding,
          finding,
        ],
        stage: ValidationStage.Unloaded,
      },
    },
  ])('should end the step as $outcome.status when $condition', ({ outcome, validation }) => {
    // Act
    const given = blocksOutcomeOf(validation);

    // Assert
    expect(given).toStrictEqual(outcome);
  });
});

describe('blocksSectionsOf', () => {
  it('should word the report as the golden file shows it', async () => {
    // Act
    const golden = goldenOf({
      sections: notesTextOf(blocksSectionsOf(advised)),
    });

    // Assert
    expect(golden).toBe(
      await goldenFileText(new URL('report.golden.txt', import.meta.url), golden),
    );
  });

  it('should give the findings, each closed by its code, then the advice when both are there', () => {
    // Act
    const sections = blocksSectionsOf(advised);

    // Assert
    expect(sections).toStrictEqual([
      noteSection({
        lines: [
          `blocks/domains/ui/ui.md: ${findingTextOf(finding)} [requires-itself]`,
        ],
        title: expect.any(String),
        tone: Tone.Error,
      }),
      noteSection({
        lines: [
          adviceMessage(advice),
        ],
        title: expect.any(String),
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
      findings: [
        webgl,
        i18n,
        canvas,
        finding,
      ],
      stage: ValidationStage.Unloaded,
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
        title: expect.any(String),
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
        model,
        stage: ValidationStage.Checked,
      },
    },
  ])('should give nothing when $condition', ({ validation }) => {
    // Act
    const sections = blocksSectionsOf(validation);

    // Assert
    expect(sections).toStrictEqual([]);
  });
});
