import { Command } from 'commander';

import { AbsolutePath } from '#/kernel/value-objects';
import type { CommandContext } from '#/shared/cli';
import { folderPathOf, linesSection } from '#/shared/cli';

import type { PresetsPlan, ProjectRead } from '../../../../domain/entities';
import { ProjectReadStatus } from '../../../../domain/entities';
import { failUnreadStep, planLinesOf } from '../../../utils';

interface PresetsPlanContext extends CommandContext {
  readonly planPresets: (startFolderPath: AbsolutePath) => ProjectRead<PresetsPlan>;
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
      const planned = context.planPresets(
        folderPathOf({
          from: AbsolutePath.create(places.cwd),
          given: places.projectDir ?? places.cwd,
        }),
      );

      if (planned.status !== ProjectReadStatus.Opened) {
        await failUnreadStep(context, planned);

        return;
      }

      await context.renderer.print([
        linesSection(planLinesOf(planned.answer)),
      ]);
    });

export { createPresetsPlanCommand };
