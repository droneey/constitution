import { StepStatus } from '@droneey/design-cli';
import { Command } from 'commander';

import type { CommandContext } from '#/shared/cli';

import type { ConfigurationsCheck } from '../../../../domain/entities';
import { configurationsOutcomeOf, configurationsSectionsOf } from '../../../utils';

interface ConfigurationsCheckContext extends CommandContext {
  readonly checkConfigurations: (start: string) => ConfigurationsCheck | undefined;
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
      const check = await context.renderer.run({
        label: 'Presets',
        outcomeOf: (checked: ConfigurationsCheck | undefined) =>
          configurationsOutcomeOf(checked, StepStatus.Failed),
        run: () => context.checkConfigurations(context.places.cwd),
      });

      await context.renderer.print(configurationsSectionsOf(check));

      if (check === undefined || check.warnings.length + check.findings.length > 0) {
        context.setFailed();
      }
    });

export { createPresetsCheckCommand };
