import { Command } from 'commander';

import type { CommandContext } from '#/shared/cli';

import { PartDiagnosis } from '../../../../domain/entities';
import { installationOutcomeOf, installationSectionsOf } from '../../../utils';

// Stryker disable ArrayDeclaration,StringLiteral: help text commander prints; no caller relies on it
const SUMMARY = 'Check the installation; it changes nothing.';
const DESCRIPTION =
  'Check the installation: this program, the Claude Code plugin, the latest release, PATH, the release link and the git hooks. It changes nothing.';
const EXAMPLES: readonly string[] = [
  'constitution doctor',
  'constitution doctor --plain',
] as const;
// Stryker restore ArrayDeclaration,StringLiteral

interface DoctorContext extends CommandContext {
  readonly diagnoseInstallation: (start: string) => Promise<readonly PartDiagnosis[]>;
}

const createDoctorCommand = (context: DoctorContext): Command =>
  context.withExamples(
    new Command('doctor')
      .summary(SUMMARY)
      .description(DESCRIPTION)
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
      }),
    EXAMPLES,
  );

export { createDoctorCommand };
