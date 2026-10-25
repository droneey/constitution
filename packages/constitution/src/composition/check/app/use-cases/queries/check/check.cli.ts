import { Command } from 'commander';

import type { Validation } from '#/features/blocks';
import { blocksOutcomeOf, blocksSectionsOf } from '#/features/blocks';
import { presetsOutcomeOf, presetsSectionsOf } from '#/features/presets';
import type { ProjectWarning } from '#/kernel/entities';
import type { CommandContext } from '#/shared/cli';
import { BASE_FLAG, baseFlagsOf } from '#/shared/cli';

interface CheckContext extends CommandContext {
  readonly checkBlocks: (input: {
    base: string | undefined;
    folder: string;
  }) => Validation | undefined;
  readonly checkPresets: (start: string) => readonly ProjectWarning[] | undefined;
}

const createCheckCommand = (context: CheckContext): Command =>
  new Command('check')
    .summary('Check the blocks in this folder, then the project around it.')
    .description(
      "Check the blocks of the Constitution or the pack in this folder, then the project's constitution.yaml and its tools' configurations.",
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
      const warnings = await renderer.run({
        label: 'Presets',
        outcomeOf: presetsOutcomeOf,
        run: () => context.checkPresets(places.cwd),
      });

      await renderer.print([
        ...blocksSectionsOf(validation),
        ...presetsSectionsOf(warnings),
      ]);

      if ((validation?.findings.length ?? 0) + (warnings?.length ?? 0) > 0) {
        context.setFailed();
      }
    });

export { createCheckCommand };
