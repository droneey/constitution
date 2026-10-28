import { describe, expect, it } from 'bun:test';

import { StepStatus, Tone } from '@droneey/design-cli';

import { createFakeContext, runCommand } from '#/__tests__/command-context.fake';
import type { Validation } from '#/features/blocks';
import { ValidationStage } from '#/features/blocks';
import type { BlockModel } from '#/kernel/entities';
import { ValueSite } from '#/kernel/entities';
import { ValueFailure } from '#/kernel/errors';
import type { AbsolutePath } from '#/kernel/value-objects';
import { BlockSource, PackPath } from '#/kernel/value-objects';
import type { StepReport } from '#/shared/cli';
import { noteSection } from '#/shared/cli';

import { createCheckCommand } from '../check.cli';

const finding: Validation['findings'][number] = {
  code: ValueFailure.Glob,
  details: {
    site: ValueSite.Governs,
    written: 'src/**/*.ts lib',
  },
  path: 'blocks/domains/ui/ui.md',
};
const model: BlockModel = {
  blocks: [],
  roles: [],
  rules: [],
};
const sound: Validation = {
  advice: [],
  findings: [],
  model,
  stage: ValidationStage.Checked,
};

const reportOf = (input: { isFailed: boolean; status: StepStatus }): StepReport => ({
  isFailed: input.isFailed,
  outcome: {
    detail: input.status,
    status: input.status,
  },
  sections: input.isFailed
    ? [
        noteSection({
          lines: [
            'found',
          ],
          title: 'found',
          tone: Tone.Error,
        }),
      ]
    : [],
});

const skipped = reportOf({
  isFailed: false,
  status: StepStatus.Skipped,
});
const done = reportOf({
  isFailed: false,
  status: StepStatus.Done,
});
const failed = reportOf({
  isFailed: true,
  status: StepStatus.Failed,
});

const runOf = async (input: {
  args?: readonly string[];
  configurations?: StepReport;
  presets?: StepReport;
  validation: Validation | undefined;
}) => {
  const asked: unknown[] = [];
  const { context, record } = createFakeContext();

  await runCommand({
    args: input.args ?? [],
    command: createCheckCommand({
      ...context,
      checkBlocks: (checked) => {
        asked.push(checked);

        return input.validation;
      },
      checkPresets: (checked) => {
        asked.push(checked);

        return input.presets ?? done;
      },
      presetsSkipped: skipped,
      checkConfigurations: (startFolderPath: AbsolutePath) => {
        asked.push(startFolderPath);

        return input.configurations ?? done;
      },
    }),
  });

  return {
    asked,
    failures: record().failures,
    printed: record().printed[0]?.length,
    steps: record().ran.map((ran) => [
      ran.label,
      ran.outcome.status,
    ]),
  };
};

describe('createCheckCommand', () => {
  it('should take the output flags the program declares after its name', async () => {
    // Arrange
    const { context } = createFakeContext();
    const command = createCheckCommand({
      ...context,
      checkBlocks: () => undefined,
      checkPresets: () => skipped,
      checkConfigurations: () => skipped,
      presetsSkipped: skipped,
    });

    // Act
    const { flags } = await runCommand({
      args: [
        '--plain',
        '--no-color',
        '--no-motion',
      ],
      command,
    });

    // Assert
    expect(flags).toStrictEqual({
      color: false,
      motion: false,
      plain: true,
    });
  });

  it("should check the blocks of the folder against the base named, the pack's presets against their model, then the project around it", async () => {
    // Arrange
    const asked = {
      args: [
        '--base',
        '../base',
      ],
      validation: sound,
    };

    // Act
    const run = await runOf(asked);

    // Assert
    expect(run).toStrictEqual({
      asked: [
        {
          base: {
            folder: '../base',
            folderPath: '/work/project/package/../base',
          },
          folderPath: '/work/project/package',
        },
        {
          model,
          source: BlockSource.create(PackPath.create('.')),
          sourceFolderPath: '/work/project/package',
        },
        '/work/project/package',
      ],
      failures: 0,
      printed: 0,
      steps: [
        [
          'Blocks',
          StepStatus.Done,
        ],
        [
          'Presets',
          StepStatus.Done,
        ],
        [
          'Configurations',
          StepStatus.Done,
        ],
      ],
    });
  });

  it('should skip the presets, asking for none, when no blocks load', async () => {
    // Arrange
    const asked = {
      validation: undefined,
    };

    // Act
    const run = await runOf(asked);

    // Assert
    expect({
      asked: run.asked,
      presets: run.steps[1],
    }).toStrictEqual({
      asked: [
        {
          base: undefined,
          folderPath: '/work/project/package',
        },
        '/work/project/package',
      ],
      presets: [
        'Presets',
        StepStatus.Skipped,
      ],
    });
  });

  it("should check the release's presets when no base is named and the blocks load", async () => {
    // Arrange
    const asked = {
      validation: sound,
    };

    // Act
    const run = await runOf(asked);

    // Assert
    expect(run.asked[1]).toStrictEqual({
      model,
      source: BlockSource.create(),
      sourceFolderPath: '/work/project/package',
    });
  });

  it.each([
    {
      condition: 'the blocks have findings',
      printed: 1,
      validation: {
        findings: [
          finding,
        ],
        stage: ValidationStage.Unloaded,
      },
    },
    {
      condition: 'the presets have findings',
      presets: failed,
      printed: 1,
      validation: sound,
    },
    {
      condition: 'the project has warnings',
      configurations: failed,
      printed: 1,
      validation: undefined,
    },
    {
      condition: 'every step found something',
      configurations: failed,
      presets: failed,
      printed: 3,
      validation: {
        ...sound,
        findings: [
          finding,
        ],
      },
    },
  ])(
    'should print what it found and end the run as failed when $condition',
    async ({ condition: _condition, printed, ...asked }) => {
      // Act
      const run = await runOf(asked);

      // Assert
      expect({
        failures: run.failures,
        printed: run.printed,
      }).toStrictEqual({
        failures: 1,
        printed,
      });
    },
  );

  it('should pass, every step skipped, when the folder holds no blocks and no project lies around it', async () => {
    // Arrange
    const asked = {
      configurations: skipped,
      presets: skipped,
      validation: undefined,
    };

    // Act
    const run = await runOf(asked);

    // Assert
    expect({
      failures: run.failures,
      steps: run.steps,
    }).toStrictEqual({
      failures: 0,
      steps: [
        [
          'Blocks',
          StepStatus.Skipped,
        ],
        [
          'Presets',
          StepStatus.Skipped,
        ],
        [
          'Configurations',
          StepStatus.Skipped,
        ],
      ],
    });
  });
});
