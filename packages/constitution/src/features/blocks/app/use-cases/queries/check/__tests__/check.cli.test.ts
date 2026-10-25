import { describe, expect, it } from 'bun:test';

import { StepStatus } from '@droneey/design-cli';

import { createFakeContext, runCommand } from '#/__tests__/command-line.fake';

import type { Validation } from '../../../../../domain/use-cases/queries/check';
import { RequiresCode } from '../../../../../domain/use-cases/queries/check';
import { createBlocksCheckCommand } from '../check.cli';

const runOf = async (input: {
  args: readonly string[];
  validation: Validation | undefined;
}): Promise<{
  asked: {
    base: string | undefined;
    folder: string;
  }[];
  failures: number;
  printed: number;
  ran: readonly {
    label: string;
    outcome: {
      detail?: string;
      status: StepStatus;
    };
  }[];
}> => {
  const asked: {
    base: string | undefined;
    folder: string;
  }[] = [];
  const { context, record } = createFakeContext();

  await runCommand({
    args: input.args,
    command: createBlocksCheckCommand({
      ...context,
      checkBlocks: (checked) => {
        asked.push(checked);

        return input.validation;
      },
    }),
    group: 'blocks',
  });

  return {
    asked,
    failures: record().failures,
    printed: record().printed.length,
    ran: record().ran,
  };
};

describe('createBlocksCheckCommand', () => {
  it.each([
    {
      args: [],
      base: undefined,
      condition: 'no base is named',
    },
    {
      args: [
        '--base',
        '.droneey/constitution',
      ],
      base: '.droneey/constitution',
      condition: 'the base is named',
    },
  ])('should check the blocks of the folder it runs in when $condition', async ({ args, base }) => {
    // Arrange
    const asked = {
      args,
      validation: {
        advice: [],
        findings: [],
      },
    };

    // Act
    const run = await runOf(asked);

    // Assert
    expect(run).toStrictEqual({
      asked: [
        {
          base,
          folder: '/work/project/package',
        },
      ],
      failures: 0,
      printed: 1,
      ran: [
        {
          label: 'Blocks',
          outcome: {
            detail: 'every block is sound',
            status: StepStatus.Done,
          },
        },
      ],
    });
  });

  it.each([
    {
      condition: 'the blocks have findings',
      outcome: {
        detail: '1 finding',
        status: StepStatus.Failed,
      },
      validation: {
        advice: [],
        findings: [
          {
            code: RequiresCode.RequiresItself,
            details: {},
            path: 'blocks/domains/ui/ui.md',
          },
        ],
      },
    },
    {
      condition: 'the folder holds no blocks',
      outcome: {
        detail: 'no blocks in this folder',
        status: StepStatus.Failed,
      },
      validation: undefined,
    },
  ])('should end the run as failed when $condition', async ({ outcome, validation }) => {
    // Arrange
    const asked = {
      args: [],
      validation,
    };

    // Act
    const run = await runOf(asked);

    // Assert
    expect({
      failures: run.failures,
      outcome: run.ran[0]?.outcome,
    }).toStrictEqual({
      failures: 1,
      outcome,
    });
  });
});
