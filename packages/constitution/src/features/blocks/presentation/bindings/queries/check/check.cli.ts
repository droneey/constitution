import { StepStatus } from '@droneey/design-cli';
import { Command } from 'commander';

import { AbsolutePath } from '#/kernel/value-objects';
import { withOption } from '#/libs/commander';
import type { CommandContext } from '#/shared/cli';
import { BASE_FLAG, baseFlagsOf } from '#/shared/cli';

import type { PackBase, Validation } from '../../../../application/use-cases/queries/check';
import { blocksOutcomeOf, blocksSectionsOf, NO_BLOCKS, packBaseOf } from '../../../utils';

interface BlocksCheckContext extends CommandContext {
  readonly checkBlocks: (input: {
    base: PackBase | undefined;
    folderPath: AbsolutePath;
  }) => Validation | undefined;
}

const createBlocksCheckCommand = (context: BlocksCheckContext): Command =>
  withOption({
    command: new Command('check')
      .description('Check the blocks of the Constitution or the pack in this folder.')
      .addHelpText(
        'before',
        context.helpExamples([
          'constitution blocks check',
          'constitution blocks check --base .droneey/constitution',
        ]),
      ),
    option: BASE_FLAG,
    parse: baseFlagsOf,
    run: async ({ base }): Promise<void> => {
      const folderPath = AbsolutePath.create(context.places.cwd);
      const validation = await context.renderer.run({
        label: 'Blocks',
        outcomeOf: (checked: Validation | undefined) =>
          checked === undefined
            ? {
                detail: NO_BLOCKS,
                status: StepStatus.Failed,
              }
            : blocksOutcomeOf(checked),
        run: () =>
          context.checkBlocks({
            base: packBaseOf({
              base,
              folderPath,
            }),
            folderPath,
          }),
      });

      await context.renderer.print(blocksSectionsOf(validation));

      if (validation === undefined || validation.findings.length > 0) {
        context.setFailed();
      }
    },
  });

export { createBlocksCheckCommand };
