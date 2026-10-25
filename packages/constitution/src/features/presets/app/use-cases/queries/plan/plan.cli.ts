import { Command } from 'commander';

import type { CommandContext } from '#/shared/cli';
import { linesSection } from '#/shared/cli';

import type { WiringPlan } from '../../../../domain/entities';
import { planLinesOf } from '../../../utils';

interface PresetsPlanContext extends CommandContext {
  readonly planPresets: (start: string) => WiringPlan;
}

/** Claude Code's project, else the folder the run starts in: /constitution:ratify runs it there. */
const createPresetsPlanCommand = (context: PresetsPlanContext): Command =>
  new Command('plan')
    .description(
      "List each configuration file the project's tools read, the units it serves, its template and the parts it takes.",
    )
    .addHelpText(
      'before',
      context.helpExamples([
        'constitution presets plan',
      ]),
    )
    .action(async (): Promise<void> => {
      const { places } = context;

      await context.renderer.print([
        linesSection(planLinesOf(context.planPresets(places.projectDir ?? places.cwd))),
      ]);
    });

export { createPresetsPlanCommand };
