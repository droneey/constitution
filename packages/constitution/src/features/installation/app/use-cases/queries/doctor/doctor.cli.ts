import { Command } from 'commander';

import type { CommandContext } from '#/shared/cli';

import { PartDiagnosis } from '../../../../domain/entities';
import { installationOutcomeOf, installationSectionsOf } from '../../../utils';

interface DoctorContext extends CommandContext {
  readonly diagnoseInstallation: (start: string) => Promise<readonly PartDiagnosis[]>;
}

const createDoctorCommand = (context: DoctorContext): Command =>
  new Command('doctor')
    .summary('Check the installation; it changes nothing.')
    .description(
      'Check the installation: this executable, the Claude Code plugin, the latest release, PATH, the release link and the git hooks. It changes nothing.',
    )
    .addHelpText(
      'before',
      context.helpExamples([
        'constitution doctor',
        'constitution doctor --plain',
      ]),
    )
    .action(async (): Promise<void> => {
      const diagnoses = await context.renderer.run({
        label: 'Installation',
        outcomeOf: installationOutcomeOf,
        run: async () => await context.diagnoseInstallation(context.places.cwd),
      });

      await context.renderer.print(installationSectionsOf(diagnoses));

      if (diagnoses.some(PartDiagnosis.isTroubled)) {
        context.setFailed();
      }
    });

export { createDoctorCommand };
