import { describe, expect, it } from 'bun:test';

import { StepStatus } from '@droneey/design-cli';

import type { Validation } from '#/features/blocks';
import { SeamsCode, ValidationStage } from '#/features/blocks';
import { Level } from '#/kernel/constants';
import type { BlockModel } from '#/kernel/entities';
import { AbsolutePath, BlockId, PackPath, RuleSlug } from '#/kernel/value-objects';

import type { PackCheckAsked, PacksProject } from '../packs-step.utils';
import { packsStepOf } from '../packs-step.utils';

const model: BlockModel = {
  blocks: [],
  lists: [],
  roles: [],
  rules: [],
};
const pack = PackPath.create('pack');
const otherPack = PackPath.create('tools/pack');

const project: PacksProject = {
  releaseFolderPath: AbsolutePath.create('/work/project/.droneey/constitution'),
  repositoryFolderPath: AbsolutePath.create('/work/project'),
  units: [
    {
      loweredRules: new Set([
        RuleSlug.create('rule-opens-with-its-slogan'),
      ]),
      packs: [
        pack,
      ],
    },
    {
      loweredRules: new Set(),
      packs: [
        pack,
        otherPack,
      ],
    },
  ],
};

const checkedOf = (findings: Validation['findings']): Validation => ({
  advice: [],
  advised: [],
  findings,
  model,
  stage: ValidationStage.Checked,
});

const seamWithCore = {
  code: SeamsCode.NotPair,
  details: {
    other: BlockId.create('core'),
  },
  path: 'blocks/implementations/acme/@foundation/with/core.md',
} satisfies Validation['findings'][number];

describe('packsStepOf', () => {
  it('should check each pack once against the release, with what its units lowered', () => {
    // Arrange
    const asked: PackCheckAsked[] = [];

    // Act
    packsStepOf({
      checkBlocks: (input) => {
        asked.push(input);
      },
      project,
    });

    // Assert
    expect(asked).toStrictEqual([
      {
        base: {
          folder: '/work/project/.droneey/constitution',
          folderPath: AbsolutePath.create('/work/project/.droneey/constitution'),
        },
        folderPath: AbsolutePath.create('/work/project/pack'),
        lowered: new Map([
          [
            'rule-opens-with-its-slogan',
            Level.Should,
          ],
        ]),
      },
      {
        base: {
          folder: '/work/project/.droneey/constitution',
          folderPath: AbsolutePath.create('/work/project/.droneey/constitution'),
        },
        folderPath: AbsolutePath.create('/work/project/tools/pack'),
        lowered: new Map(),
      },
    ]);
  });

  it('should give no step when no pack holds blocks', () => {
    // Act
    const step = packsStepOf({
      checkBlocks: () => undefined,
      project,
    });

    // Assert
    expect(step).toBeUndefined();
  });

  it.each([
    {
      condition: 'a pack holds a finding',
      findings: [
        seamWithCore,
      ],
      isFailed: true,
      outcome: {
        detail: '2 findings',
        status: StepStatus.Failed,
      },
    },
    {
      condition: 'every pack is sound',
      findings: [],
      isFailed: false,
      outcome: {
        detail: 'every pack is sound',
        status: StepStatus.Done,
      },
    },
  ])(
    'should end the step as its findings say when $condition',
    ({ findings, isFailed, outcome }) => {
      // Act
      const step = packsStepOf({
        checkBlocks: () => checkedOf(findings),
        project,
      });

      // Assert
      expect({
        isFailed: step?.isFailed,
        outcome: step?.outcome,
      }).toStrictEqual({
        isFailed,
        outcome,
      });
    },
  );

  it("should place each finding of a pack whose blocks do not load under the pack's folder", () => {
    // Act
    const step = packsStepOf({
      checkBlocks: () => ({
        findings: [
          seamWithCore,
        ],
        stage: ValidationStage.Unloaded,
      }),
      project,
    });

    // Assert
    expect(JSON.stringify(step?.sections)).toContain(
      'tools/pack/blocks/implementations/acme/@foundation/with/core.md',
    );
  });

  it("should place each advised finding under its pack's folder", () => {
    // Act
    const step = packsStepOf({
      checkBlocks: () => ({
        ...checkedOf([]),
        advised: [
          seamWithCore,
        ],
      }),
      project,
    });

    // Assert
    expect(JSON.stringify(step?.sections)).toContain(
      'tools/pack/blocks/implementations/acme/@foundation/with/core.md',
    );
  });
});
