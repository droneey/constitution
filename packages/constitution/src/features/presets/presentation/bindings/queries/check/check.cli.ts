import { StepStatus } from '@droneey/design-cli';
import { Command } from 'commander';

import { AbsolutePath } from '#/kernel/value-objects';
import type { CommandContext, StepReport } from '#/shared/cli';

import type { ConfigurationsCheck } from '../../../../domain/configurations-check/entities';
import type { ProjectRead } from '../../../../domain/presets-project/entities';
import { configurationsStepOf } from '../../../utils';

interface ConfigurationsCheckContext extends CommandContext {
  /**
   * @throws {UnreadableFileError} when the project's constitution.yaml cannot be read
   * @throws {ReleaseError} when the release's blocks cannot be listed
   */
  readonly checkConfigurations: (startFolderPath: AbsolutePath) => ProjectRead<ConfigurationsCheck>;
}

const createPresetsCheckCommand = (context: ConfigurationsCheckContext): Command =>
  new Command('check')
    .description(
      "Check the project's constitution.yaml, its preset files, and that its tools' configurations hold what the presets compute.",
    )
    .addHelpText(
      'before',
      context.helpExamples([
        'constitution presets check',
      ]),
    )
    .action(async (): Promise<void> => {
      const step = await context.renderer.run({
        label: 'Presets',
        outcomeOf: (checked: StepReport) => checked.outcome,
        /**
         * @throws {UnreadableFileError} when the project's constitution.yaml cannot be read
         * @throws {ReleaseError} when the release's blocks cannot be listed
         */
        run: () =>
          configurationsStepOf(
            context.checkConfigurations(AbsolutePath.create(context.places.cwd)),
            StepStatus.Failed,
          ),
      });

      await context.renderer.print(step.sections);

      if (step.isFailed) {
        context.setFailed();
      }
    });

export { createPresetsCheckCommand };
