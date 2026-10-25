import { StepStatus } from '@droneey/design-cli';
import { Command } from 'commander';

import type { CommandContext } from '#/shared/cli';
import { BASE_FLAG, baseFlagsOf } from '#/shared/cli';

import type { Validation } from '../../../../domain/use-cases/queries/check';
import { blocksOutcomeOf, blocksSectionsOf } from '../../../utils';

// Stryker disable ArrayDeclaration,StringLiteral: help text commander prints; no caller relies on it
const DESCRIPTION = 'Check the blocks of the Constitution or the pack in this folder.';
const EXAMPLES: readonly string[] = [
  'constitution blocks check',
  'constitution blocks check --base .droneey/constitution',
] as const;
// Stryker restore ArrayDeclaration,StringLiteral

interface BlocksCheckContext extends CommandContext {
  readonly checkBlocks: (input: {
    base: string | undefined;
    folder: string;
  }) => Validation | undefined;
}

const createBlocksCheckCommand = (context: BlocksCheckContext): Command =>
  context.withExamples(
    new Command('check')
      .description(DESCRIPTION)
      .option(BASE_FLAG.flags, BASE_FLAG.description)
      .action(async (_options: unknown, command: Command): Promise<void> => {
        const { base } = baseFlagsOf(command.opts());
        const validation = await context.renderer.run({
          label: 'Blocks',
          outcomeOf: (checked: Validation | undefined) =>
            checked === undefined
              ? {
                  detail: 'no blocks in this folder',
                  status: StepStatus.Failed,
                }
              : blocksOutcomeOf(checked),
          run: () =>
            context.checkBlocks({
              base,
              folder: context.places.cwd,
            }),
        });

        await context.renderer.print(blocksSectionsOf(validation));

        if (validation === undefined || validation.findings.length > 0) {
          context.setFailed();
        }
      }),
    EXAMPLES,
  );

export { createBlocksCheckCommand };
