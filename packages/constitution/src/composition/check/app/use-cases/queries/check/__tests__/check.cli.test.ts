import { describe, expect, it } from 'bun:test';

import { StepStatus } from '@droneey/design-cli';

import { createFakeContext, runCommand } from '#/__tests__/command-context.fake';
import type { Validation } from '#/features/blocks';
import type { ProjectWarning } from '#/kernel/entities';
import { ValueSite, WarningKind } from '#/kernel/entities';
import { ValueFailure } from '#/kernel/errors';

import { createCheckCommand } from '../check.cli';

const finding: Validation['findings'][number] = {
  code: ValueFailure.Glob,
  details: {
    site: ValueSite.Governs,
    written: 'src/**/*.ts lib',
  },
  path: 'blocks/domains/ui/ui.md',
};
const warning: ProjectWarning = {
  details: {
    name: 'nope',
  },
  kind: WarningKind.NameUnknown,
};

const runOf = async (input: {
  args?: readonly string[];
  validation: Validation | undefined;
  warnings: readonly ProjectWarning[] | undefined;
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
      checkPresets: (start: string) => {
        asked.push(start);

        return input.warnings;
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
      checkPresets: () => [],
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

  it('should check the blocks of the folder, against the base named, then the project around it', async () => {
    // Arrange
    const asked = {
      args: [
        '--base',
        '../base',
      ],
      validation: {
        advice: [],
        findings: [],
      },
      warnings: [],
    };

    // Act
    const run = await runOf(asked);

    // Assert
    expect(run).toStrictEqual({
      asked: [
        {
          base: '../base',
          folder: '/work/project/package',
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
      ],
    });
  });

  it.each([
    {
      condition: 'the blocks have findings',
      printed: 1,
      validation: {
        advice: [],
        findings: [
          finding,
        ],
      },
      warnings: undefined,
    },
    {
      condition: 'the project has warnings',
      printed: 1,
      validation: undefined,
      warnings: [
        warning,
      ],
    },
    {
      condition: 'both have some',
      printed: 2,
      validation: {
        advice: [],
        findings: [
          finding,
        ],
      },
      warnings: [
        warning,
      ],
    },
  ])(
    'should print what it found and end the run as failed when $condition',
    async ({ printed, validation, warnings }) => {
      // Arrange
      const asked = {
        validation,
        warnings,
      };

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

  it('should pass, both steps skipped, when the folder holds no blocks and no project lies around it', async () => {
    // Arrange
    const asked = {
      validation: undefined,
      warnings: undefined,
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
      ],
    });
  });
});
