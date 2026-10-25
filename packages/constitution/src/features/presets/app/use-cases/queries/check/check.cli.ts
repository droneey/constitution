import { StepStatus } from '@droneey/design-cli';
import { Command } from 'commander';

import type { ProjectWarning } from '#/kernel/entities';
import type { CommandContext } from '#/shared/cli';

import { presetsOutcomeOf, presetsSectionsOf } from '../../../utils';

interface PresetsCheckContext extends CommandContext {
  readonly checkPresets: (start: string) => readonly ProjectWarning[] | undefined;
}

const createPresetsCheckCommand = (context: PresetsCheckContext): Command =>
  new Command('check')
    .description(
      "Check the project's constitution.yaml, and that its tools' configurations take every part of its blocks' presets.",
    )
    .addHelpText(
      'before',
      context.helpExamples([
        'constitution presets check',
      ]),
    )
    .action(async (): Promise<void> => {
      const warnings = await context.renderer.run({
        label: 'Presets',
        outcomeOf: (checked: readonly ProjectWarning[] | undefined) =>
          presetsOutcomeOf(checked, StepStatus.Failed),
        run: () => context.checkPresets(context.places.cwd),
      });

      await context.renderer.print(presetsSectionsOf(warnings));

      if (warnings === undefined || warnings.length > 0) {
        context.setFailed();
      }
    });

export { createPresetsCheckCommand };
