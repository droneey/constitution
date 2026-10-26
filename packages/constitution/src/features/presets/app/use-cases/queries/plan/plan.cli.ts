import { Command } from 'commander';

import type { CommandContext } from '#/shared/cli';
import { linesSection } from '#/shared/cli';

import type { PresetsPlan } from '../../../../domain/entities';
import { planLinesOf } from '../../../utils';

interface PresetsPlanContext extends CommandContext {
  readonly planPresets: (start: string) => PresetsPlan;
}

/** Claude Code's project, else the folder the run starts in: /constitution:ratify runs it there. */
const createPresetsPlanCommand = (context: PresetsPlanContext): Command =>
  new Command('plan')
    .description(
      'List each file the presets write in the project, with the entries it takes, and what is wrong with the preset files.',
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
