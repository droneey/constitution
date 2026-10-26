import { Command } from 'commander';

import type { Validation } from '#/features/blocks';
import { blocksOutcomeOf, blocksSectionsOf } from '#/features/blocks';
import type { BlockModel } from '#/kernel/entities';
import type { CommandContext, StepReport } from '#/shared/cli';
import { BASE_FLAG, baseFlagsOf } from '#/shared/cli';

interface CheckContext extends CommandContext {
  readonly checkBlocks: (input: {
    base: string | undefined;
    folder: string;
  }) => Validation | undefined;
  readonly checkConfigurations: (start: string) => StepReport;
  /** the presets beside the blocks, checked against their model where they load */
  readonly checkPresets: (input: {
    folder: string;
    isRelease: boolean;
    model: BlockModel | undefined;
  }) => StepReport;
}

const outcomeOf = (report: StepReport): StepReport['outcome'] => report.outcome;

const createCheckCommand = (context: CheckContext): Command =>
  new Command('check')
    .summary('Check the blocks in this folder, then the project around it.')
    .description(
      "Check the blocks of the Constitution or the pack in this folder and its presets, then the project's constitution.yaml and its tools' configurations.",
    )
    .addHelpText(
      'before',
      context.helpExamples([
        'constitution check',
        'constitution check --base .droneey/constitution',
      ]),
    )
    .option(BASE_FLAG.flags, BASE_FLAG.description)
    .action(async (_options: unknown, command: Command): Promise<void> => {
      const { base } = baseFlagsOf(command.opts());
      const { places, renderer } = context;
      const validation = await renderer.run({
        label: 'Blocks',
        outcomeOf: blocksOutcomeOf,
        run: () =>
          context.checkBlocks({
            base,
            folder: places.cwd,
          }),
      });
      const presets = await renderer.run({
        label: 'Presets',
        outcomeOf,
        run: () =>
          context.checkPresets({
            folder: places.cwd,
            isRelease: base === undefined,
            model: validation?.model,
          }),
      });
      const configurations = await renderer.run({
        label: 'Configurations',
        outcomeOf,
        run: () => context.checkConfigurations(places.cwd),
      });

      await renderer.print([
        ...blocksSectionsOf(validation),
        ...presets.sections,
        ...configurations.sections,
      ]);

      if ((validation?.findings.length ?? 0) > 0 || presets.isFailed || configurations.isFailed) {
        context.setFailed();
      }
    });

export { createCheckCommand };
