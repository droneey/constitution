import { describe, expect, it } from 'bun:test';

import { StepStatus } from '@droneey/design-cli';

import { createFakeContext, runCommand } from '#/__tests__/command-context.fake';

import type { Validation } from '../../../../../domain/use-cases/queries/check';
import { RequiresCode } from '../../../../../domain/use-cases/queries/check';
import { blocksOutcomeOf } from '../../../../utils';
import { createBlocksCheckCommand } from '../check.cli';

const soundValidation: Validation = {
  advice: [],
  findings: [],
};

const foundValidation: Validation = {
  advice: [],
  findings: [
    {
      code: RequiresCode.RequiresItself,
      details: {},
      path: 'blocks/domains/ui/ui.md',
    },
  ],
};

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
      validation: soundValidation,
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
          outcome: blocksOutcomeOf(soundValidation),
        },
      ],
    });
  });

  it.each([
    {
      condition: 'the blocks have findings',
      outcome: blocksOutcomeOf(foundValidation),
      validation: foundValidation,
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
