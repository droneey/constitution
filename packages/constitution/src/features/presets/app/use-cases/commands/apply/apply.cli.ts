import { Command } from 'commander';

import type { CommandContext } from '#/shared/cli';

import type { ApplyReport, RunAsked, RunPlan } from '../../../../domain/entities';
import type { RunStepsContext } from '../../../utils';
import { applyOutcomeOf, applySectionsOf, runSteps } from '../../../utils';

interface PresetsApplyContext extends CommandContext, RunStepsContext {
  readonly applyPresets: (start: string) => ApplyReport | undefined;
  readonly planRun: (input: RunAsked) => RunPlan;
}

interface ApplyOptions {
  readonly fix: boolean;
}

const FIX = 'fix';

/** Claude Code's project, else the folder the run starts in: /constitution:ratify runs it there. */
const createPresetsApplyCommand = (context: PresetsApplyContext): Command =>
  new Command('apply')
    .description(
      "Write what the presets compute for the project's blocks into its tools' configurations, beside its own settings, and keep each unit's constitution.lock; then run the fix of each unit it wrote a file of.",
    )
    .option('--no-fix', 'leave the files as written, running no fix')
    .addHelpText(
      'before',
      context.helpExamples([
        'constitution presets apply',
        'constitution presets apply --no-fix',
      ]),
    )
    .action(async (options: ApplyOptions): Promise<void> => {
      const { places } = context;
      const start = places.projectDir ?? places.cwd;
      const report = await context.renderer.run({
        label: 'Presets',
        outcomeOf: applyOutcomeOf,
        run: () => context.applyPresets(start),
      });

      await context.renderer.print(applySectionsOf(report));

      if (report === undefined || report.findings.length > 0) {
        context.setFailed();

        return;
      }

      if (options.fix && report.units.length > 0) {
        runSteps(
          context,
          context.planRun({
            name: FIX,
            start,
            units: report.units,
          }),
        );
      }
    });

export { createPresetsApplyCommand };
