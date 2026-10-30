import { StepStatus } from '@droneey/design-cli';
import { Command } from 'commander';

import type { PackBase, Validation } from '#/features/blocks';
import {
  blocksOutcomeOf,
  blocksSectionsOf,
  NO_BLOCKS,
  packBaseOf,
  ValidationStage,
} from '#/features/blocks';
import type { BlockModel } from '#/kernel/entities';
import { AbsolutePath, BlockSource, PackPath } from '#/kernel/value-objects';
import { withOption } from '#/libs/commander';
import type { CommandContext, StepReport } from '#/shared/cli';
import { BASE_FLAG, baseFlagsOf } from '#/shared/cli';

interface CheckContext extends CommandContext {
  readonly checkBlocks: (input: {
    base: PackBase | undefined;
    folderPath: AbsolutePath;
  }) => Validation | undefined;
  /**
   * @throws {UnreadableFileError} when the project's constitution.yaml cannot be read
   * @throws {ReleaseError} when the release's blocks cannot be listed
   */
  readonly checkConfigurations: (startFolderPath: AbsolutePath) => StepReport;
  readonly checkPresets: (input: {
    model: BlockModel;
    source: BlockSource;
    sourceFolderPath: AbsolutePath;
  }) => StepReport;
  readonly presetsSkipped: StepReport;
}

const outcomeOf = (report: StepReport): StepReport['outcome'] => report.outcome;

const createCheckCommand = (context: CheckContext): Command =>
  withOption({
    command: new Command('check')
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
      ),
    option: BASE_FLAG,
    parse: baseFlagsOf,
    run: async ({ base }): Promise<void> => {
      const { places, renderer } = context;
      const folderPath = AbsolutePath.create(places.cwd);
      const validation = await renderer.run({
        label: 'Blocks',
        outcomeOf: (checked: Validation | undefined) =>
          checked === undefined
            ? {
                detail: NO_BLOCKS,
                status: StepStatus.Skipped,
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
      const presets = await renderer.run({
        label: 'Presets',
        outcomeOf,
        run: () =>
          validation?.stage === ValidationStage.Checked
            ? context.checkPresets({
                model: validation.model,
                source:
                  base === undefined
                    ? BlockSource.create()
                    : BlockSource.create(PackPath.create('.')),
                sourceFolderPath: folderPath,
              })
            : context.presetsSkipped,
      });
      const configurations = await renderer.run({
        label: 'Configurations',
        outcomeOf,
        /**
         * @throws {UnreadableFileError} when the project's constitution.yaml cannot be read
         * @throws {ReleaseError} when the release's blocks cannot be listed
         */
        run: () => context.checkConfigurations(folderPath),
      });

      await renderer.print([
        ...blocksSectionsOf(validation),
        ...presets.sections,
        ...configurations.sections,
      ]);

      if ((validation?.findings.length ?? 0) > 0 || presets.isFailed || configurations.isFailed) {
        context.setFailed();
      }
    },
  });

export { createCheckCommand };
