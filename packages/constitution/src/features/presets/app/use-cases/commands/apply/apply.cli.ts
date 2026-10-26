import { Command } from 'commander';

import type { CommandContext } from '#/shared/cli';

import type { ApplyReport } from '../../../../domain/entities';
import { applyOutcomeOf, applySectionsOf } from '../../../utils';

interface PresetsApplyContext extends CommandContext {
  readonly applyPresets: (start: string) => ApplyReport | undefined;
}

/** Claude Code's project, else the folder the run starts in: /constitution:ratify runs it there. */
const createPresetsApplyCommand = (context: PresetsApplyContext): Command =>
  new Command('apply')
    .description(
      "Write what the presets' catalogues compute for the project's blocks into its tools' configurations, beside its own settings, and keep each unit's constitution.lock.",
    )
    .addHelpText(
      'before',
      context.helpExamples([
        'constitution presets apply',
      ]),
    )
    .action(async (): Promise<void> => {
      const { places } = context;
      const report = await context.renderer.run({
        label: 'Presets',
        outcomeOf: applyOutcomeOf,
        run: () => context.applyPresets(places.projectDir ?? places.cwd),
      });

      await context.renderer.print(applySectionsOf(report));

      if (report === undefined || report.findings.length > 0) {
        context.setFailed();
      }
    });

export { createPresetsApplyCommand };
